import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ db: 'ok', env: { hasGoog: !!process.env.GOOGLE_CLIENT_ID, hasDbUrl: !!process.env.DATABASE_URL } })
  } catch (e: any) {
    return NextResponse.json({ db: 'error', msg: e.message }, { status: 500 })
  }
}
