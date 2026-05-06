import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { bookingId } = await request.json()

    // Get the booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'No payment found for this booking' }, { status: 400 })
    }

    // Capture the payment — this is when the customer is actually charged
    await stripe.paymentIntents.capture(booking.stripe_payment_intent_id)

    // Update booking to completed and payment to paid
    await supabase
      .from('bookings')
      .update({
        status: 'completed',
        payment_status: 'paid',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    // Notify customer
    await supabase.from('notifications').insert({
      user_id: booking.customer_id,
      type: 'service_completed',
      title: 'Service completed — payment released',
      body: 'Your service has been marked as complete and payment has been processed. Please leave a review!',
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Release payment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
