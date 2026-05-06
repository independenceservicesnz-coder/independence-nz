import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('=== Checkout session started ===')
  console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SERVICE_ROLE exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('STRIPE_KEY exists:', !!process.env.STRIPE_SECRET_KEY)
  console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured. Please call 027 325 9707 to book.' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })

    // Parse request body
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
      customerId,
      customerEmail,
      customerName,
    } = body

    // Validate required fields
    if (!priceCents || !scheduledDate || !scheduledTime || !providerName || !serviceName) {
      return NextResponse.json(
        { error: 'Missing required booking details.' },
        { status: 400 }
      )
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'You must be signed in to book.' },
        { status: 401 }
      )
    }

    // Step 1: Save booking to Supabase as PENDING
    // This happens BEFORE Stripe so we always have a record
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        customer_id: customerId,
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

    if (bookingError || !booking) {
      console.error('Supabase booking error:', bookingError)
      return NextResponse.json(
        { error: 'Could not save booking. Please try again.' },
        { status: 500 }
      )
    }

    // Step 2: Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://independencenz.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: serviceName,
              description: `${providerName} · ${new Date(scheduledDate).toLocaleDateString('en-NZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })} at ${scheduledTime}`,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        // ESCROW: Authorise card but don't capture until service complete
        capture_method: 'manual',
        description: `Independence NZ · ${serviceName} · ${providerName}`,
        metadata: {
          bookingId: booking.id,
          customerId,
          customerName: customerName || '',
          customerEmail: customerEmail || '',
          providerId: providerId || '',
          providerName,
          serviceName,
          scheduledDate,
          scheduledTime,
          address: address || '',
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
          message: 'Your card is authorised but not charged until your service is complete. No platform fees.',
        },
      },
    })

    // Step 3: Update booking with Stripe session ID
    await supabaseAdmin
      .from('bookings')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    // Step 4: Return Stripe checkout URL to frontend
    return NextResponse.json({
      url: session.url,
      bookingId: booking.id,
    })

  } catch (error: any) {
    console.error('Checkout error:', error)

    // Give helpful error messages
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Payment system error. Please call 027 325 9707 to book.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again or call 027 325 9707.' },
      { status: 500 }
    )
  }
}
