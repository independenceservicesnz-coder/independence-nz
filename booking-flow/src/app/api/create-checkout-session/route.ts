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
      serviceName,
      serviceDescription,
      priceCents,
      scheduledDate,
      scheduledTime,
      providerId,
      serviceId,
    } = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Create Stripe checkout session with manual capture
    // This HOLDS the payment but does NOT charge until you release it
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: profile?.email || user.email,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: serviceName,
              description: `${providerName} · ${scheduledDate} at ${scheduledTime}`,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        // This is the key line — holds payment, does not capture
        capture_method: 'manual',
        metadata: {
          customerId: user.id,
          providerId: providerId || '',
          serviceId: serviceId || '',
          providerName,
          serviceName,
          scheduledDate,
          scheduledTime,
          priceCents: priceCents.toString(),
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/browse`,
      metadata: {
        customerId: user.id,
        providerId: providerId || '',
        serviceId: serviceId || '',
        providerName,
        serviceName,
        scheduledDate,
        scheduledTime,
        priceCents: priceCents.toString(),
      },
    })

    // Save booking as payment_held — not yet paid
    await supabase.from('bookings').insert({
      customer_id: user.id,
      provider_id: providerId || null,
      service_id: serviceId || null,
      status: 'confirmed',
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      amount_cents: priceCents,
      payment_status: 'held',
      stripe_payment_intent_id: session.payment_intent as string,
      notes: `Payment held. Will be released when service is completed.`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
