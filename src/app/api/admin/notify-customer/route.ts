import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { customerId, bookingId, type, title, body } = await request.json()

    if (!customerId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await supabase.from('notifications').insert({
      user_id: customerId,
      type: type || 'general',
      title,
      body: body || '',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Notify error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
