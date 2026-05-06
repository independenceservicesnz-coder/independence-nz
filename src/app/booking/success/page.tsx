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

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, providers(business_name), services(name)')
    .eq('customer_id', user!.id)
    .in('status', ['confirmed', 'pending'])
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
              Your booking is confirmed. Your card has been authorised but you will not be charged until the service is completed.
            </p>

            {booking && (
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left space-y-3">
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
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time</span>
                  <span className="font-medium">{booking.scheduled_time?.slice(0, 5)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-semibold text-brand-500">
                    ${(booking.amount_cents / 100).toFixed(2)} NZD
                  </span>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5 text-left">
              <p className="text-sm font-semibold text-amber-700 mb-1">
                🔒 Your payment is held safely
              </p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Your card has been authorised but not charged yet. Payment is only released once your service is completed. This protects you as a customer.
              </p>
            </div>

            <div className="bg-brand-50 rounded-xl p-4 mb-5 text-left">
              <p className="text-xs text-brand-600 leading-relaxed">
                <strong>What happens next:</strong><br />
                1. Your provider will arrive at the scheduled time<br />
                2. Once the service is complete, payment is released<br />
                3. You will be asked to leave a star rating and review
              </p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-6">
              <p className="text-xs text-green-700 font-medium text-center">
                💚 You have only been charged for the service — no platform fees, no hidden costs
              </p>
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
              Need help?{' '}
              <a href="tel:0273259707" className="text-brand-500 font-medium">
                Call 027 325 9707
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
