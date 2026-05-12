import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import OpenAI from 'openai'

export async function GET() {
  const results: Record<string, any> = {}

  // Test 1: Supabase Storage bucket
  try {
    const supabase = getSupabase()
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      results.supabase = { ok: false, error: error.message }
    } else {
      const hasDocBucket = buckets?.some(b => b.name === 'documents')
      results.supabase = { ok: true, buckets: buckets?.map(b => b.name), hasDocBucket }
    }
  } catch (e: any) {
    results.supabase = { ok: false, error: e.message }
  }

  // Test 2: OpenAI
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const models = await openai.models.list()
    const hasGpt4o = models.data.some(m => m.id === 'gpt-4o')
    results.openai = { ok: true, models: models.data.length, hasGpt4o }
  } catch (e: any) {
    results.openai = { ok: false, error: e.message }
  }

  // Test 3: Env vars
  results.env = {
    dbUrl: !!process.env.DATABASE_URL,
    openAiKey: !!process.env.OPENAI_API_KEY,
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    googleId: !!process.env.GOOGLE_CLIENT_ID,
    stripeSecret: !!process.env.STRIPE_SECRET_KEY,
  }

  return NextResponse.json(results)
}
