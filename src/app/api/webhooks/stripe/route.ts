import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Webhook event:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId

    if (bookingId) {
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'held',
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_session_id: session.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)

      console.log('Booking confirmed:', bookingId)

      // Notify customer
      const customerId = session.metadata?.customerId
      if (customerId) {
        await supabase.from('notifications').insert({
          user_id: customerId,
          type: 'booking_confirmed',
          title: '✅ Booking confirmed!',
          body: `Your booking for ${session.metadata?.serviceName} with ${session.metadata?.providerName} is confirmed. Payment is held securely until your service is complete.`,
        })
      }
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const bookingId = pi.metadata?.bookingId
    if (bookingId) {
      await supabase
        .from('bookings')
        .update({ status: 'completed', payment_status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    const bookingId = pi.metadata?.bookingId
    if (bookingId) {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled', payment_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
    }
  }

  return NextResponse.json({ received: true })
}
