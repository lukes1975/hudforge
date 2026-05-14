import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // TODO: Integrate with Supabase
    // For now, just log
    console.log('Waitlist signup:', email)

    // Mock success
    return NextResponse.json({
      success: true,
      message: 'Added to waitlist',
      email
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// TODO: Supabase integration
/*
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data, error } = await supabase
  .from('waitlist')
  .insert({ email, created_at: new Date().toISOString() })

if (error) throw error

// TODO: Send welcome email via Resend
*/
