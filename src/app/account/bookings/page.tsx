import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Bookings error:', error)
  }

  const all: any[] = bookings || []
  const upcoming = all.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status))
  const past = all.filter(b => ['completed', 'cancelled'].includes(b.status))

  const statusConfig: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
    pending: { label: 'Payment pending', bgClass: 'bg-amber-100', textClass: 'text-amber-700', icon: '⏳' },
    confirmed: { label: 'Confirmed', bgClass: 'bg-brand-50', textClass: 'text-brand-500', icon: '✅' },
    in_progress: { label: 'In progress', bgClass: 'bg-blue-50', textClass: 'text-blue-600', icon: '🔄' },
    completed: { label: 'Completed', bgClass: 'bg-gray-100', textClass: 'text-gray-500', icon: '✓' },
    cancelled: { label: 'Cancelled', bgClass: 'bg-red-50', textClass: 'text-red-500', icon: '✕' },
  }

  const paymentConfig: Record<string, { label: string; textClass: string; icon: string }> = {
    pending: { label: 'Awaiting payment confirmation', textClass: 'text-amber-600', icon: '⏳' },
    held: { label: 'Payment held securely — released when service complete', textClass: 'text-brand-500', icon: '🔒' },
    paid: { label: 'Payment released', textClass: 'text-gray-500', icon: '✅' },
    failed: { label: 'Payment failed', textClass: 'text-red-500', icon: '❌' },
  }

  const BookingCard = ({ b }: { b: any }) => {
    const status = statusConfig[b.status] || { label: b.status, bgClass: 'bg-gray-100', textClass: 'text-gray-500', icon: '•' }
    const payment = paymentConfig[b.payment_status] || { label: b.payment_status, textClass: 'text-gray-400', icon: '•' }

    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Status header */}
        <div className={`flex items-center justify-between px-5 py-3 ${b.status === 'confirmed' ? 'bg-brand-50' : 'bg-gray-50'} border-b border-gray-100`}>
          <div className="flex items-center gap-2">
            <span>{status.icon}</span>
            <span className={`text-xs font-semibold ${status.textClass}`}>{status.label}</span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(b.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="p-5">
          {/* Service info */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl shrink-0">🏠</div>
              <div>
                <p className="font-semibold text-gray-900">{b.service_name}</p>
                <p className="text-sm text-gray-500">{b.provider_name}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-brand-500 text-xl">${(b.amount_cents / 100).toFixed(2)}</p>
              <p className="text-xs text-gray-400">NZD</p>
            </div>
          </div>

          {/* Booking details grid */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 mb-4 text-xs">
            <div>
              <p className="text-gray-400 mb-1">Date</p>
              <p className="font-semibold text-gray-700">
                {new Date(b.scheduled_date).toLocaleDateString('en-NZ', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Time</p>
              <p className="font-semibold text-gray-700">{b.scheduled_time?.slice(0, 5)}</p>
            </div>
            {b.address && (
              <div className="col-span-2">
                <p className="text-gray-400 mb-1">Address</p>
                <p className="font-semibold text-gray-700">{b.address}</p>
              </div>
            )}
            {b.notes && (
              <div className="col-span-2">
                <p className="text-gray-400 mb-1">Notes</p>
                <p className="font-semibold text-gray-700">{b.notes}</p>
              </div>
            )}
          </div>

          {/* Payment status */}
          <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3 mb-4">
            <span className="text-base mt-0.5">{payment.icon}</span>
            <p className={`text-xs ${payment.textClass} leading-relaxed`}>{payment.label}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <a href="tel:0273259707" className="text-xs text-brand-500 font-medium">
              📞 Need help? Call 027 325 9707
            </a>
            <Link href="/browse" className="text-xs text-brand-500 font-medium hover:underline">
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
          <p className="text-gray-400 text-sm mt-1">All your service bookings in one place.</p>
        </div>
        <Link href="/browse" className="btn-primary text-xs px-4 py-2">+ Book a service</Link>
      </div>

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 inline-block"></span>
            Upcoming bookings ({upcoming.length})
          </h2>
          <div className="space-y-4">
            {upcoming.map(b => <BookingCard key={b.id} b={b} />)}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
            Past bookings ({past.length})
          </h2>
          <div className="space-y-4">
            {past.map(b => <BookingCard key={b.id} b={b} />)}
          </div>
        </section>
      )}

      {all.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-serif text-xl font-medium mb-2">No bookings yet</p>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Browse trusted local providers and make your first booking. You only pay for the service.
          </p>
          <Link href="/browse" className="btn-primary">Browse services →</Link>
        </div>
      )}

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
