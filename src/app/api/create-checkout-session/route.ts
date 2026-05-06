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
      return NextResponse.json(
        { error: 'You must be signed in to book a service.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      providerName,
      providerId,
      serviceName,
      serviceId,
      serviceDescription,
      priceCents,
      scheduledDate,
      scheduledTime,
      address,
      notes,
    } = body

    // Validate required fields
    if (!priceCents || !scheduledDate || !scheduledTime || !providerName || !serviceName) {
      return NextResponse.json(
        { error: 'Missing required booking details.' },
        { status: 400 }
      )
    }

    // Get customer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const customerEmail = profile?.email || user.email || ''

    // Create booking record in Supabase FIRST
    // This way we have a booking ID to reference
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        provider_id: providerId || null,
        service_id: serviceId || null,
        status: 'pending',
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        address: address || null,
        notes: notes || null,
        amount_cents: priceCents,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking insert error:', bookingError)
      return NextResponse.json(
        { error: 'Could not create booking. Please try again.' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    // capture_method: 'manual' = card is authorised but NOT charged
    // Payment only captured when you release it after service is complete
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: serviceName,
              description: `${providerName} · ${new Date(scheduledDate).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })} at ${scheduledTime}`,
              images: [],
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        // ESCROW: Card authorised but money NOT taken until service complete
        capture_method: 'manual',
        description: `Independence NZ · ${serviceName} · ${providerName}`,
        metadata: {
          bookingId: booking.id,
          customerId: user.id,
          customerName: profile?.full_name || '',
          customerEmail,
          providerId: providerId || '',
          providerName,
          serviceName,
          scheduledDate,
          scheduledTime,
          address: address || '',
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/browse?cancelled=true`,
      metadata: {
        bookingId: booking.id,
        customerId: user.id,
        providerName,
        serviceName,
        scheduledDate,
        scheduledTime,
      },
      // Custom text shown on Stripe checkout page
      custom_text: {
        submit: {
          message: 'Your card will be authorised but not charged until your service is complete. You only pay for the service — no platform fees.',
        },
      },
    })

    // Update booking with Stripe session ID
    await supabase
      .from('bookings')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    // Return Stripe checkout URL
    return NextResponse.json({
      url: session.url,
      bookingId: booking.id,
    })

  } catch (error: any) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again or call 027 325 9707.' },
      { status: 500 }
    )
  }
}
