import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const {
      customerId, serviceName, providerName, priceCents,
      scheduledDate, scheduledTime, address, notes, paymentStatus,
    } = await request.json()

    if (!customerId || !serviceName || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        service_name: serviceName,
        provider_name: providerName || 'Independence NZ',
        amount_cents: priceCents || 0,
        status: 'confirmed',
        payment_status: paymentStatus || 'held',
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime || '09:00',
        address: address || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Manual booking error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Notify customer
    const bookingDate = new Date(scheduledDate).toLocaleDateString('en-NZ', {
      weekday: 'long', day: 'numeric', month: 'long'
    })

    await supabase.from('notifications').insert({
      user_id: customerId,
      type: 'booking_confirmed',
      title: '✅ Booking confirmed by Independence NZ!',
      body: `Your ${serviceName} with ${providerName || 'Independence NZ'} has been confirmed for ${bookingDate} at ${scheduledTime || '09:00'}${address ? ` at ${address}` : ''}. We look forward to seeing you!`,
    })

    return NextResponse.json({ success: true, bookingId: booking.id })
  } catch (error: any) {
    console.error('Manual booking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
