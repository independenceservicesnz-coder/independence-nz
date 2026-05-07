import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Booking request received:', body)

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

    if (!customerId) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
    }

    if (!priceCents || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: 'Missing booking details.' }, { status: 400 })
    }

    // Save to Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('Saving booking to Supabase...')
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        provider_name: providerName || 'Provider',
        provider_id: providerId || null,
        service_name: serviceName || 'Service',
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
        error: 'Could not save booking: ' + bookingError.message
      }, { status: 500 })
    }

    console.log('Booking saved! ID:', booking.id)

    // Create Stripe session
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
            name: serviceName || 'Service',
            description: `${providerName} · ${scheduledDate} at ${scheduledTime}`,
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual',
        metadata: {
          bookingId: booking.id,
          customerId,
          providerName: providerName || '',
          serviceName: serviceName || '',
        },
      },
      success_url: `${appUrl}/booking/success?booking_id=${booking.id}`,
      cancel_url: `${appUrl}/browse`,
      metadata: {
        bookingId: booking.id,
        customerId,
      },
      custom_text: {
        submit: {
          message: 'Card authorised but not charged until service is complete. No platform fees.',
        },
      },
    })

    console.log('Stripe session created:', session.url)

    await supabase
      .from('bookings')
      .update({
        stripe_payment_intent_id: session.payment_intent as string || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    return NextResponse.json({ url: session.url, bookingId: booking.id })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({
      error: error.message || 'Something went wrong. Please call 027 325 9707.'
    }, { status: 500 })
  }
}
