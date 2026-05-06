import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Use service role to bypass RLS in webhooks
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
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const meta = (event.data.object as any).metadata || {}

  switch (event.type) {

    // Customer completed checkout — card authorised, money held
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const sessionMeta = session.metadata || {}
      const bookingId = sessionMeta.bookingId

      if (bookingId) {
        // Update booking to confirmed with payment held
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'held',
            stripe_payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        // Send confirmation notification to customer
        await supabaseAdmin.from('notifications').insert({
          user_id: sessionMeta.customerId,
          type: 'booking_confirmed',
          title: '✅ Booking confirmed!',
          body: `Your booking for ${sessionMeta.serviceName} with ${sessionMeta.providerName} on ${new Date(sessionMeta.scheduledDate).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })} at ${sessionMeta.scheduledTime} is confirmed. Your payment is held securely and will only be released once the service is complete.`,
          data: { bookingId },
        })
      }
      break
    }

    // Payment failed — cancel booking
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const bookingId = pi.metadata?.bookingId

      if (bookingId) {
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'cancelled',
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        // Notify customer
        if (pi.metadata?.customerId) {
          await supabaseAdmin.from('notifications').insert({
            user_id: pi.metadata.customerId,
            type: 'payment_failed',
            title: '❌ Payment failed',
            body: 'Your payment could not be processed. Please try booking again or call us on 027 325 9707.',
            data: { bookingId },
          })
        }
      }
      break
    }

    // Payment captured (released after service complete)
    case 'payment_intent.amount_capturable_updated': {
      const pi = event.data.object as Stripe.PaymentIntent
      const bookingId = pi.metadata?.bookingId

      if (bookingId && pi.status === 'requires_capture') {
        await supabaseAdmin
          .from('bookings')
          .update({
            payment_status: 'held',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)
      }
      break
    }

    // Payment fully captured — service complete and paid
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const bookingId = pi.metadata?.bookingId

      if (bookingId) {
        await supabaseAdmin
          .from('bookings')
          .update({
            status: 'completed',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        // Notify customer payment released
        if (pi.metadata?.customerId) {
          await supabaseAdmin.from('notifications').insert({
            user_id: pi.metadata.customerId,
            type: 'payment_released',
            title: '💳 Payment released',
            body: 'Your service is complete and payment has been released. Please leave a review to help others!',
            data: { bookingId },
          })
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
