import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Update the most recent pending booking to confirmed
  if (user) {
    await supabase
      .from('bookings')
      .update({ status: 'confirmed', payment_status: 'paid' })
      .eq('customer_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
  }

  // Get the latest confirmed booking for display
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, providers(business_name), services(name)')
    .eq('customer_id', user!.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="font-serif text-3xl font-medium text-brand-500 mb-2">
              Booking confirmed!
            </h1>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Your booking has been confirmed and payment processed successfully. You will receive a confirmation email shortly.
            </p>

            {booking && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Service</span>
                  <span className="font-medium">{(booking.services as any)?.name || 'Service'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Provider</span>
                  <span className="font-medium">{(booking.providers as any)?.business_name || 'Provider'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Date</span>
                  <span className="font-medium">
                    {new Date(booking.scheduled_date).toLocaleDateString('en-NZ', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time</span>
                  <span className="font-medium">{booking.scheduled_time?.slice(0, 5)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                  <span className="text-gray-400">Amount paid</span>
                  <span className="font-semibold text-brand-500">
                    ${(booking.amount_cents / 100).toFixed(2)} NZD
                  </span>
                </div>
              </div>
            )}

            <div className="bg-brand-50 rounded-xl p-4 mb-6 text-sm text-brand-600 text-left">
              <p className="font-medium mb-1">💳 Payment processed securely</p>
              <p className="text-brand-500/80">Your payment was handled safely through Independence NZ. A receipt has been sent to your email.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/account/bookings" className="btn-primary justify-center py-3">
                View my bookings
              </Link>
              <Link href="/browse" className="btn-secondary justify-center py-3">
                Book another service
              </Link>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Need help? Call us on{' '}
              <a href="tel:0273259707" className="text-brand-500 font-medium">027 325 9707</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
