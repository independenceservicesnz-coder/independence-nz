import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { bookingId, stripePaymentIntentId } = await request.json()

    if (!bookingId) return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

    // Capture the payment (release from escrow)
    if (stripePaymentIntentId) {
      await stripe.paymentIntents.capture(stripePaymentIntentId)
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'completed',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    // Get booking for notification
    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_id, service_name, provider_name')
      .eq('id', bookingId)
      .single()

    // Notify customer
    if (booking?.customer_id) {
      await supabase.from('notifications').insert({
        user_id: booking.customer_id,
        type: 'service_completed',
        title: '🎉 Service complete — payment released!',
        body: `Your ${booking.service_name} with ${booking.provider_name} is complete and payment has been processed. Thank you — please leave a review!`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Release payment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
