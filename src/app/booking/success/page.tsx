import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { booking_id?: string; session_id?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Please sign in to view your booking.</p>
        </div>
      </div>
    )
  }

  // Get booking details
  const bookingId = searchParams.booking_id

  let booking: any = null

  if (bookingId) {
    const { data } = await supabase
      .from('bookings')
      .select('*, providers(business_name, suburb, city), services(name)')
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single()
    booking = data
  }

  // Fallback to most recent booking if no ID
  if (!booking) {
    const { data } = await supabase
      .from('bookings')
      .select('*, providers(business_name, suburb, city), services(name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    booking = data
  }

  const formattedDate = booking?.scheduled_date
    ? new Date(booking.scheduled_date).toLocaleDateString('en-NZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  const formattedTime = booking?.scheduled_time?.slice(0, 5) || null
  const amountNZD = booking?.amount_cents ? (booking.amount_cents / 100).toFixed(2) : null

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-4">

          {/* Success card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Green header */}
            <div className="bg-gradient-to-r from-brand-500 to-brand-400 px-8 py-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h1 className="font-serif text-3xl font-medium mb-2">Booking confirmed!</h1>
              <p className="text-white/80 text-sm">
                A confirmation has been sent to your email
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Booking details */}
              {booking && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-medium text-sm text-gray-700 mb-3">Booking details</h3>
                  {booking.services?.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Service</span>
                      <span className="font-medium">{booking.services.name}</span>
                    </div>
                  )}
                  {booking.providers?.business_name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Provider</span>
                      <span className="font-medium">{booking.providers.business_name}</span>
                    </div>
                  )}
                  {formattedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Date</span>
                      <span className="font-medium">{formattedDate}</span>
                    </div>
                  )}
                  {formattedTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Time</span>
                      <span className="font-medium">{formattedTime}</span>
                    </div>
                  )}
                  {booking.address && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Address</span>
                      <span className="font-medium text-right max-w-48">{booking.address}</span>
                    </div>
                  )}
                  {amountNZD && (
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-3">
                      <span className="text-gray-400">Amount authorised</span>
                      <span className="font-bold text-brand-500">${amountNZD} NZD</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment escrow notice */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">🔒</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 mb-1">Your payment is held securely</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Your card has been authorised but <strong>you have not been charged yet</strong>. Payment is only released once your service is complete and you are happy. This protects you as a customer.
                    </p>
                  </div>
                </div>
              </div>

              {/* No fees notice */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p className="text-xs text-green-700 font-medium">
                  💚 You have only been authorised for the service cost — no platform fees, no hidden charges
                </p>
              </div>

              {/* What happens next */}
              <div className="bg-brand-50 rounded-xl p-4">
                <p className="text-sm font-medium text-brand-700 mb-3">What happens next</p>
                <div className="space-y-2">
                  {[
                    { n: '1', text: 'Your provider will contact you to confirm details' },
                    { n: '2', text: 'They arrive at your scheduled time and complete the service' },
                    { n: '3', text: 'Once you are happy, payment is released to Independence NZ' },
                    { n: '4', text: 'You will be invited to leave a star rating and review' },
                  ].map(s => (
                    <div key={s.n} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                      <p className="text-xs text-brand-600 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/account/bookings"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm text-center"
                >
                  View my bookings →
                </Link>
                <Link
                  href="/browse"
                  className="w-full border border-gray-200 hover:border-brand-300 text-gray-600 font-medium py-3.5 rounded-xl transition-colors text-sm text-center"
                >
                  Book another service
                </Link>
              </div>
            </div>
          </div>

          {/* Help footer */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Need to make a change or have a question?</p>
            <p className="text-xs text-gray-400 mb-3">Our NZ-based team is here to help</p>
            <a
              href="tel:0273259707"
              className="inline-flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-500 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              📞 Call 027 325 9707
            </a>
            <p className="text-xs text-gray-400 mt-2">Mon–Fri 8am–6pm · Sat 9am–3pm</p>
          </div>
        </div>
      </div>
    </div>
  )
}
