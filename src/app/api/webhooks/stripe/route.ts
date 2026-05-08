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
  const meta = (event.data.object as any).metadata || {}

  switch (event.type) {

    // ✅ Payment authorised — booking confirmed, money held
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      const customerId = session.metadata?.customerId

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'held',
            stripe_payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        // Get booking details for notification
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single()

        if (customerId && booking) {
          const bookingDate = new Date(booking.scheduled_date).toLocaleDateString('en-NZ', {
            weekday: 'long', day: 'numeric', month: 'long'
          })

          // Booking confirmed notification
          await supabase.from('notifications').insert({
            user_id: customerId,
            type: 'booking_confirmed',
            title: '✅ Booking confirmed!',
            body: `Your ${booking.service_name} with ${booking.provider_name} is confirmed for ${bookingDate} at ${booking.scheduled_time?.slice(0, 5)}. Your payment is held securely until the service is complete.`,
          })

          // Reminder notification (would normally be scheduled — this is immediate for now)
          await supabase.from('notifications').insert({
            user_id: customerId,
            type: 'booking_pending',
            title: '📋 Booking details saved',
            body: `We have saved your booking to your account. You can view and manage it anytime under My Bookings.`,
          })
        }
      }
      break
    }

    // 💳 Payment captured — service complete
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const bookingId = pi.metadata?.bookingId
      const customerId = pi.metadata?.customerId

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({
            status: 'completed',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        if (customerId) {
          await supabase.from('notifications').insert({
            user_id: customerId,
            type: 'service_completed',
            title: '🎉 Service complete — payment released',
            body: 'Your service is complete and payment has been released. Please leave a star rating and review to help others!',
          })
        }
      }
      break
    }

    // ❌ Payment failed
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const bookingId = pi.metadata?.bookingId
      const customerId = pi.metadata?.customerId

      if (bookingId) {
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId)

        if (customerId) {
          await supabase.from('notifications').insert({
            user_id: customerId,
            type: 'payment_failed',
            title: '❌ Payment failed',
            body: 'Your payment could not be processed. Please try booking again or call us on 027 325 9707.',
          })
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
