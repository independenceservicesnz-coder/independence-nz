import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('=== CREATE CHECKOUT SESSION CALLED ===')

  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY')
      return NextResponse.json({ error: 'Payment not configured. Call 027 325 9707.' }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase env vars')
      return NextResponse.json({ error: 'Database not configured. Call 027 325 9707.' }, { status: 500 })
    }

    // Parse body
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body))

    const {
      customerId,
      customerEmail,
      customerName,
      providerName,
      providerId,
      serviceName,
      priceCents,
      scheduledDate,
      scheduledTime,
      address,
      notes,
    } = body

    // Validate required fields
    if (!customerId) {
      return NextResponse.json({ error: 'Not signed in. Please sign in and try again.' }, { status: 401 })
    }
    if (!providerName || !serviceName || !priceCents || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: 'Missing booking details.' }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Save booking to Supabase FIRST
    console.log('Saving booking to Supabase for customer:', customerId)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        provider_name: providerName,
        provider_id: providerId || null,
        service_name: serviceName,
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
      console.error('Supabase error:', bookingError)
      return NextResponse.json({
        error: `Database error: ${bookingError.message}. Please call 027 325 9707.`
      }, { status: 500 })
    }

    console.log('Booking saved! ID:', booking.id)

    // Create Stripe session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://independencenz.com'

    console.log('Creating Stripe session...')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [{
        price_data: {
          currency: 'nzd',
          product_data: {
            name: serviceName,
            description: `${providerName} · ${scheduledDate} at ${scheduledTime}`,
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual', // Hold payment until service complete
        metadata: {
          bookingId: booking.id,
          customerId,
          providerName,
          serviceName,
        },
      },
      success_url: `${appUrl}/booking/success?booking_id=${booking.id}`,
      cancel_url: `${appUrl}/browse`,
      metadata: {
        bookingId: booking.id,
        customerId,
        providerName,
        serviceName,
        scheduledDate,
        scheduledTime,
      },
      custom_text: {
        submit: {
          message: 'Card authorised but not charged until service is complete. No platform fees.',
        },
      },
    })

    console.log('Stripe session created:', session.id)

    // Update booking with Stripe session ID
    await supabase
      .from('bookings')
      .update({
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    console.log('=== SUCCESS - Redirecting to Stripe ===')
    return NextResponse.json({ url: session.url, bookingId: booking.id })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({
      error: error.message || 'Something went wrong. Please call 027 325 9707.'
    }, { status: 500 })
  }
}
