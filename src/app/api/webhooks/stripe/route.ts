import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata || {}

    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'held',
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', meta.customerId)
      .eq('status', 'pending')

    await supabaseAdmin.from('notifications').insert({
      user_id: meta.customerId,
      type: 'booking_confirmed',
      title: 'Booking confirmed!',
      body: `Your booking for ${meta.serviceName} with ${meta.providerName} on ${meta.scheduledDate} at ${meta.scheduledTime} is confirmed. Payment will only be taken once your service is complete.`,
    })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    await supabaseAdmin
      .from('bookings')
      .update({ payment_status: 'failed', status: 'cancelled' })
      .eq('stripe_payment_intent_id', pi.id)
  }

  return NextResponse.json({ received: true })
}
