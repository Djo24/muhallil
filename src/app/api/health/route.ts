import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const dbUrl = typeof process.env.DATABASE_URL === 'string'
    return NextResponse.json({ dbUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
