import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: bookings }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
    supabase.from('bookings').select('id, status, scheduled_date, scheduled_time, providers(business_name), services(name)').eq('customer_id', user!.id).order('scheduled_date', { ascending: false }).limit(5),
  ])

  const allBookings = (bookings as any[]) || []
  const upcoming = allBookings.filter((b: any) => ['confirmed', 'pending'].includes(b.status))
  const completed = allBookings.filter((b: any) => b.status === 'completed').length
  const firstName = profile?.full_name?.split(' ')[0] || ''

  const statusClass: Record<string, string> = {
    confirmed: 'badge-green',
    pending: 'badge-amber',
    completed: 'badge-gray',
    cancelled: 'text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-500',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium">Welcome back{firstName ? `, ${firstName}` : ''} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your bookings, reviews, and account settings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[['Total bookings', allBookings.length], ['Completed', completed], ['Reviews', 0]].map(([label, val]) => (
          <div key={label as string} className="card p-5">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="font-serif text-3xl font-medium">{val}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-medium text-sm flex items-center gap-2">📅 Upcoming bookings</h2>
          <Link href="/account/bookings" className="text-xs text-brand-500">View all →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-gray-400 text-sm mb-3">No upcoming bookings</p>
            <Link href="/browse" className="btn-primary text-xs px-4 py-2">Browse services</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map((b: any) => (
              <div key={b.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-lg shrink-0">🏠</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.services?.name}</p>
                  <p className="text-xs text-gray-400">{b.providers?.business_name} · {new Date(b.scheduled_date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })} at {b.scheduled_time?.slice(0, 5)}</p>
                </div>
                <span className={statusClass[b.status] || 'badge-gray'}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/browse" className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl p-5 transition-colors block">
          <p className="font-medium mb-1">Book a service</p>
          <p className="text-sm text-white/70">Browse trusted providers near you</p>
        </Link>
        <Link href="/account/bookings" className="card hover:border-brand-200 p-5 block transition-colors">
          <p className="font-medium mb-1">View all bookings</p>
          <p className="text-sm text-gray-400">Manage upcoming and past bookings</p>
        </Link>
      </div>
    </div>
  )
}
