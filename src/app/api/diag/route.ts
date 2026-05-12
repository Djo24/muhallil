import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const results: Record<string, any> = {}

  // Check and create documents bucket
  try {
    const supabase = getSupabase()
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) throw error

    const hasDocBucket = buckets?.some(b => b.name === 'documents')
    if (hasDocBucket) {
      results.storage = { ok: true, buckets: buckets.map((b: any) => b.name), message: 'documents bucket exists' }
    } else {
      const { error: createErr } = await supabase.storage.createBucket('documents', { public: true })
      if (createErr) throw createErr
      results.storage = { ok: true, buckets: [...buckets.map((b: any) => b.name), 'documents'], message: 'documents bucket created!' }
    }
  } catch (e: any) {
    results.storage = { ok: false, error: e.message }
  }

  // Env vars check
  results.env = {
    dbUrl: !!process.env.DATABASE_URL,
    openAiKey: !!process.env.OPENAI_API_KEY,
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
  }

  return NextResponse.json(results)
}
