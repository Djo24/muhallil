import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const statements = [
  `CREATE TABLE IF NOT EXISTS "Account" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"type" TEXT NOT NULL,"provider" TEXT NOT NULL,"providerAccountId" TEXT NOT NULL,"refresh_token" TEXT,"access_token" TEXT,"expires_at" INTEGER,"token_type" TEXT,"scope" TEXT,"id_token" TEXT,"session_state" TEXT,CONSTRAINT "Account_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL,"sessionToken" TEXT NOT NULL,"userId" TEXT NOT NULL,"expires" TIMESTAMP(3) NOT NULL,CONSTRAINT "Session_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL,"name" TEXT,"email" TEXT,"password" TEXT,"emailVerified" TIMESTAMP(3),"image" TEXT,"plan" TEXT NOT NULL DEFAULT 'free',"stripeCustomerId" TEXT,"stripeSubscriptionId" TEXT,"documentsUsed" INTEGER NOT NULL DEFAULT 0,"billingCycleStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "User_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "documents" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"title" TEXT NOT NULL,"fileName" TEXT NOT NULL,"fileType" TEXT NOT NULL,"fileUrl" TEXT,"status" TEXT NOT NULL DEFAULT 'uploading',"documentType" TEXT,"oneSentenceSummary" TEXT,"executiveSummary" TEXT,"detailedSummary" JSONB,"decisionsRequired" JSONB,"dates" JSONB,"financials" JSONB,"people" JSONB,"risks" JSONB,"rawText" TEXT,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "documents_pkey" PRIMARY KEY ("id"))`,
  `CREATE TABLE IF NOT EXISTS "VerificationToken" ("identifier" TEXT NOT NULL,"token" TEXT NOT NULL,"expires" TIMESTAMP(3) NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider","providerAccountId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier","token")`,
  `ALTER TABLE "Account" ADD CONSTRAINT IF NOT EXISTS "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "Session" ADD CONSTRAINT IF NOT EXISTS "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "documents" ADD CONSTRAINT IF NOT EXISTS "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
]

export async function GET() {
  const results: { sql: string; ok: boolean; error?: string }[] = []
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql)
      results.push({ sql: sql.substring(0, 50), ok: true })
    } catch (e: any) {
      results.push({ sql: sql.substring(0, 50), ok: false, error: e.message })
    }
  }
  return NextResponse.json({ success: true, results })
}
