import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type WaitlistPayload = {
  email?: string
  source?: string
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for waitlist capture')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WaitlistPayload
    const email = normalizeEmail(body.email)

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const source = body.source || 'landing_page'
    const metadata = {
      referer: req.headers.get('referer') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    }

    const { error } = await supabase
      .from('waitlist')
      .upsert(
        {
          email,
          source,
          metadata,
        },
        {
          onConflict: 'email',
          ignoreDuplicates: true,
        }
      )

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Added to waitlist',
      email,
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}

function normalizeEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
