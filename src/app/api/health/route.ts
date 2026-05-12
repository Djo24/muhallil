import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL ? 'defined' : 'missing'
    const { PrismaClient } = await import('@prisma/client')
    const p = new PrismaClient()
    await p.$connect()
    return NextResponse.json({ db: 'ok', dbUrl, msg: 'connected' })
  } catch (e: any) {
    return NextResponse.json({ db: 'error', dbUrl: process.env.DATABASE_URL ? 'defined' : 'missing', msg: e.message }, { status: 500 })
  }
}
