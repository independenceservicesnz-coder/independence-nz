import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ReviewButton from '@/components/account/ReviewButton'

export default async function BookingsPage() {
const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: raw } = await supabase
    .from('bookings')
    .select('*, providers(id, business_name), services(name, duration_minutes), reviews(id, rating)')
    .eq('customer_id', user!.id)
    .order('scheduled_date', { ascending: false })

  const bookings: any[] = raw || []
  const upcoming = bookings.filter((b: any) => ['pending', 'confirmed', 'in_progress'].includes(b.status))
  const past = bookings.filter((b: any) => ['completed', 'cancelled'].includes(b.status))

  const statusClass: Record<string, string> = {
    pending: 'badge-amber',
    confirmed: 'badge-green',
    in_progress: 'text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600',
    completed: 'badge-gray',
    cancelled: 'text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-500',
  }

  const BookingCard = ({ b }: { b: any }) => {
    const hasReview = (b.reviews?.length || 0) > 0
    const canReview = b.status === 'completed' && !hasReview
    return (
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-xl shrink-0">🏠</div>
            <div>
              <p className="font-medium text-sm">{b.services?.name}</p>
              <p className="text-xs text-gray-400">{b.providers?.business_name}</p>
            </div>
          </div>
          <span className={statusClass[b.status] || 'badge-gray'}>
            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-3 mb-4 text-xs">
          <div>
            <p className="text-gray-400 mb-0.5">Date</p>
            <p className="font-medium">{new Date(b.scheduled_date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Time</p>
            <p className="font-medium">{b.scheduled_time?.slice(0, 5)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Paid</p>
            <p className="font-medium">${(b.amount_cents / 100).toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
          {canReview && <ReviewButton bookingId={b.id} providerId={b.provider_id} />}
          {hasReview && <span className="text-xs text-amber-500 font-medium">{'★'.repeat(b.reviews[0].rating)} Reviewed</span>}
          <Link href="/browse" className="text-xs text-brand-500 font-medium ml-auto">Rebook →</Link>
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
        <Link href="/browse" className="btn-primary text-xs px-4 py-2">+ Book a service</Link>
      </div>

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 inline-block"></span> Upcoming
          </h2>
          <div className="space-y-3">{upcoming.map((b: any) => <BookingCard key={b.id} b={b} />)}</div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span> Past bookings
          </h2>
          <div className="space-y-3">{past.map((b: any) => <BookingCard key={b.id} b={b} />)}</div>
        </section>
      )}

      {bookings.length === 0 && (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="font-medium mb-2">No bookings yet</p>
          <p className="text-sm text-gray-400 mb-5">Browse trusted local providers and make your first booking.</p>
          <Link href="/browse" className="btn-primary">Browse services</Link>
        </div>
      )}
    </div>
  )
}
