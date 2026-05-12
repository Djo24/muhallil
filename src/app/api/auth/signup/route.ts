import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ received: true, name: body.name, email: body.email }, { status: 200 });
  } catch (e: any) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
