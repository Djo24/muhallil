import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, createPortalSession, getStripe } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        documentsUsed: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, name, planId } = body;

    if (action === "create-checkout") {
      const priceId = planId === "pro" ? process.env.STRIPE_PRO_PRICE_ID : planId === "business" ? process.env.STRIPE_BUSINESS_PRICE_ID : null;
      if (!priceId) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }

      let user = await prisma.user.findUnique({ where: { id: session.user.id } });
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const stripe = getStripe();
        const customer = await stripe.customers.create({
          email: session.user.email!,
          name: session.user.name || undefined,
        });
        customerId = customer.id;
        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const url = await createCheckoutSession(customerId, priceId);
      return NextResponse.json({ url });
    }

    if (action === "create-portal") {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.stripeCustomerId) {
        return NextResponse.json({ error: "No subscription found" }, { status: 400 });
      }
      const url = await createPortalSession(user.stripeCustomerId);
      return NextResponse.json({ url });
    }

    if (action === "cancel-subscription") {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.stripeSubscriptionId) {
        return NextResponse.json({ error: "No active subscription" }, { status: 400 });
      }
      const stripe = getStripe();
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: "free",
          stripeSubscriptionId: null,
          documentsUsed: 0,
          billingCycleStart: new Date(),
        },
      });
      return NextResponse.json({ success: true, plan: "free" });
    }

    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed.length < 1 || trimmed.length > 100) {
        return NextResponse.json({ error: "Name must be between 1 and 100 characters" }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: trimmed },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
