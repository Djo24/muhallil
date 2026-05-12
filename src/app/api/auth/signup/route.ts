import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const g = globalThis as any
const db: PrismaClient = g.__prisma ?? (g.__prisma = new PrismaClient())

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
    const existing = await db.user.findUnique({ where: { email: email || 'none' } });
    return NextResponse.json({ received: true, name, email, existing: !!existing }, { status: 200 });
  } catch (e: any) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
