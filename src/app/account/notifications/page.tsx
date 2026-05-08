import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user!.id)
    .eq('is_read', false)

  const all = notifications || []

  const notifIcon = (type: string) => {
    if (type === 'booking_confirmed') return '✅'
    if (type === 'booking_pending') return '⏳'
    if (type === 'provider_coming') return '🚗'
    if (type === 'service_completed') return '🎉'
    if (type === 'payment_released') return '💳'
    if (type === 'payment_failed') return '❌'
    return '🔔'
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">Stay updated on your bookings and services.</p>
        </div>
        {all.length > 0 && (
          <span className="text-xs text-gray-400">{all.length} notification{all.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {all.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-5xl mb-4">🔔</p>
          <p className="font-serif text-xl font-medium mb-2">All caught up</p>
          <p className="text-sm text-gray-400 mb-6">
            Booking confirmations, provider updates, and service reminders will appear here.
          </p>
          <Link href="/browse" className="btn-primary">Browse services</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {all.map((n, i) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 ${i < all.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-xl shrink-0">
                {notifIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                {n.body && (
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                )}
                <p className="text-xs text-gray-300 mt-1.5">{timeAgo(n.created_at)}</p>
              </div>
            </div>
          ))}
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

