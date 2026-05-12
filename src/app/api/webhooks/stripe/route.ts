import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && session.subscription) {
          await prisma.user.update({
            where: { stripeCustomerId: session.customer as string },
            data: {
              stripeSubscriptionId: session.subscription as string,
              plan: "pro",
              documentsUsed: 0,
              billingCycleStart: new Date(),
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice & { subscription: string };
        if (invoice.customer && invoice.subscription) {
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          const plan = sub.items.data[0]?.price?.id === process.env.STRIPE_BUSINESS_PRICE_ID ? "business" : "pro";

          await prisma.user.update({
            where: { stripeCustomerId: invoice.customer as string },
            data: {
              plan,
              stripeSubscriptionId: invoice.subscription as string,
              billingCycleStart: new Date(),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subDeleted = event.data.object as Stripe.Subscription;
        if (subDeleted.customer) {
          await prisma.user.update({
            where: { stripeCustomerId: subDeleted.customer as string },
            data: {
              plan: "free",
              stripeSubscriptionId: null,
              documentsUsed: 0,
              billingCycleStart: new Date(),
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
