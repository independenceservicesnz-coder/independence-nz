import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ReviewButton from '@/components/account/ReviewButton'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('bookings')
    .select('*, providers(id, business_name, suburb, city), services(name, duration_minutes), reviews(id, rating)')
    .eq('customer_id', user!.id)
    .order('scheduled_date', { ascending: false })

  const bookings: any[] = raw || []
  const upcoming = bookings.filter((b: any) =>
    ['pending', 'confirmed', 'in_progress'].includes(b.status)
  )
  const past = bookings.filter((b: any) =>
    ['completed', 'cancelled'].includes(b.status)
  )

  const statusConfig: Record<string, { label: string; class: string; icon: string }> = {
    pending: { label: 'Payment pending', class: 'bg-amber-100 text-amber-700', icon: '⏳' },
    confirmed: { label: 'Confirmed', class: 'bg-brand-50 text-brand-500', icon: '✅' },
    in_progress: { label: 'In progress', class: 'bg-blue-50 text-blue-600', icon: '🔄' },
    completed: { label: 'Completed', class: 'bg-gray-100 text-gray-500', icon: '✓' },
    cancelled: { label: 'Cancelled', class: 'bg-red-50 text-red-500', icon: '✕' },
  }

  const paymentConfig: Record<string, { label: string; class: string }> = {
    pending: { label: 'Payment pending', class: 'text-amber-600' },
    held: { label: 'Payment held securely', class: 'text-brand-500' },
    paid: { label: 'Payment released', class: 'text-gray-400' },
    failed: { label: 'Payment failed', class: 'text-red-500' },
    refunded: { label: 'Refunded', class: 'text-gray-400' },
  }

  const BookingCard = ({ b }: { b: any }) => {
    const hasReview = (b.reviews?.length || 0) > 0
    const canReview = b.status === 'completed' && !hasReview
    const status = statusConfig[b.status] || { label: b.status, class: 'bg-gray-100 text-gray-500', icon: '•' }
    const payment = paymentConfig[b.payment_status] || { label: b.payment_status, class: 'text-gray-400' }

    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-all">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span>{status.icon}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.class}`}>
              {status.label}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Booked {new Date(b.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <div className="p-5">
          {/* Service and provider */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl shrink-0">
                🏠
              </div>
              <div>
                <p className="font-medium text-gray-900">{b.services?.name || 'Service'}</p>
                <p className="text-sm text-gray-400">{b.providers?.business_name || 'Provider'}</p>
                {b.providers?.suburb && (
                  <p className="text-xs text-gray-400">{b.providers.suburb}, {b.providers.city}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-brand-500 text-lg">
                ${(b.amount_cents / 100).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">NZD</p>
            </div>
          </div>

          {/* Date, time, address */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 mb-4 text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">Date</p>
              <p className="font-medium text-gray-700">
                {new Date(b.scheduled_date).toLocaleDateString('en-NZ', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Time</p>
              <p className="font-medium text-gray-700">{b.scheduled_time?.slice(0, 5) || '—'}</p>
            </div>
            {b.address && (
              <div className="col-span-2">
                <p className="text-gray-400 mb-0.5">Address</p>
                <p className="font-medium text-gray-700">{b.address}</p>
              </div>
            )}
            {b.notes && (
              <div className="col-span-2">
                <p className="text-gray-400 mb-0.5">Notes</p>
                <p className="font-medium text-gray-700">{b.notes}</p>
              </div>
            )}
          </div>

          {/* Payment status */}
          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-gray-50 rounded-xl">
            <span className="text-base">
              {b.payment_status === 'held' ? '🔒' : b.payment_status === 'paid' ? '✅' : b.payment_status === 'failed' ? '❌' : '⏳'}
            </span>
            <div>
              <p className={`text-xs font-medium ${payment.class}`}>{payment.label}</p>
              {b.payment_status === 'held' && (
                <p className="text-xs text-gray-400">Your card is authorised. Payment releases when service is complete.</p>
              )}
              {b.payment_status === 'paid' && (
                <p className="text-xs text-gray-400">Payment processed successfully.</p>
              )}
              {b.payment_status === 'pending' && (
                <p className="text-xs text-gray-400">Awaiting payment confirmation.</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
            {canReview && (
              <ReviewButton bookingId={b.id} providerId={b.provider_id} />
            )}
            {hasReview && (
              <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                {'★'.repeat(b.reviews[0].rating)}
                <span className="text-gray-400 font-normal ml-1">Review submitted</span>
              </div>
            )}
            {b.status === 'confirmed' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block"></span>
                Provider will contact you
              </div>
            )}
            <Link
              href="/browse"
              className="text-xs text-brand-500 font-medium ml-auto hover:underline"
            >
              Book again →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">My Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">View and manage all your service bookings.</p>
        </div>
        <Link href="/browse" className="btn-primary text-xs px-4 py-2">
          + Book a service
        </Link>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 inline-block"></span>
            Upcoming bookings
          </h2>
          <div className="space-y-4">
            {upcoming.map((b: any) => <BookingCard key={b.id} b={b} />)}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
            Past bookings
          </h2>
          <div className="space-y-4">
            {past.map((b: any) => <BookingCard key={b.id} b={b} />)}
          </div>
        </section>
      )}

      {/* Empty state */}
      {bookings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-serif text-xl font-medium mb-2">No bookings yet</p>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Browse trusted local providers and make your first booking. You only pay for the service — no extra fees.
          </p>
          <Link href="/browse" className="btn-primary">
            Browse services →
          </Link>
        </div>
      )}

      {/* Help section */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
        <p className="text-sm font-medium text-gray-700 mb-1">Need help with a booking?</p>
        <p className="text-xs text-gray-400 mb-3">Our NZ-based team is here Mon–Fri 8am–6pm · Sat 9am–3pm</p>
        <a href="tel:0273259707"
          className="inline-flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-500 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
          📞 Call 027 325 9707
        </a>
      </div>
    </div>
  )
}
