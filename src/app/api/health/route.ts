import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    const hash = await bcrypt.hash('test', 12)
    const users = await prisma.user.count()
    return NextResponse.json({ db: 'ok', hash: !!hash, users })
  } catch (e: any) {
    return NextResponse.json({ db: 'error', msg: e.message, stack: e.stack?.split('\n').slice(0,3).join('; ') }, { status: 500 })
  }
}
