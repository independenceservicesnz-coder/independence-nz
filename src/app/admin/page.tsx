import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Get ALL bookings for admin view
  // Using service role would be better but this works for now
  const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*, profiles:customer_id(full_name, email, phone)')
    .order('created_at', { ascending: false })

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false })

  const all: any[] = bookings || []
  const pending = all.filter(b => b.status === 'pending')
  const confirmed = all.filter(b => b.status === 'confirmed')
  const completed = all.filter(b => b.status === 'completed')
  const totalRevenue = all.filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.amount_cents || 0), 0)
  const heldRevenue = all.filter(b => b.payment_status === 'held')
    .reduce((sum, b) => sum + (b.amount_cents || 0), 0)

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-brand-50 text-brand-500',
    in_progress: 'bg-blue-50 text-blue-600',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-50 text-red-500',
  }

  const paymentColors: Record<string, string> = {
    pending: 'text-amber-600',
    held: 'text-brand-500',
    paid: 'text-gray-400',
    failed: 'text-red-500',
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Independence NZ — all bookings and customers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-serif font-medium">{all.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total bookings</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 text-center">
            <p className="text-3xl font-serif font-medium text-amber-700">{pending.length}</p>
            <p className="text-xs text-amber-600 mt-1">Pending payment</p>
          </div>
          <div className="bg-brand-50 rounded-xl border border-brand-100 p-4 text-center">
            <p className="text-3xl font-serif font-medium text-brand-500">{confirmed.length}</p>
            <p className="text-xs text-brand-500 mt-1">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-serif font-medium text-brand-500">
              ${(heldRevenue / 100).toFixed(0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Payment held (NZD)</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-3xl font-serif font-medium">
              ${(totalRevenue / 100).toFixed(0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Released (NZD)</p>
          </div>
        </div>

        {/* All Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-medium">All Bookings ({all.length})</h2>
            <a href="https://dashboard.stripe.com" target="_blank"
              className="text-xs text-brand-500 font-medium hover:underline">
              Open Stripe dashboard →
            </a>
          </div>

          {all.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No bookings yet. When customers book services they will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Service</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {all.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium">{b.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{b.profiles?.email || ''}</p>
                        {b.profiles?.phone && <p className="text-xs text-gray-400">{b.profiles.phone}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{b.service_name}</p>
                        {b.address && <p className="text-xs text-gray-400 mt-0.5">{b.address}</p>}
                        {b.notes && <p className="text-xs text-gray-400 italic mt-0.5">"{b.notes}"</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p>{b.provider_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {new Date(b.scheduled_date).toLocaleDateString('en-NZ', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-400">{b.scheduled_time?.slice(0, 5)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-brand-500">${(b.amount_cents / 100).toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[b.status] || 'bg-gray-100 text-gray-500'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-xs font-medium ${paymentColors[b.payment_status] || 'text-gray-400'}`}>
                          {b.payment_status}
                        </p>
                        {b.stripe_payment_intent_id && (
                          <p className="text-xs text-gray-300 mt-0.5 font-mono">
                            {b.stripe_payment_intent_id.slice(0, 12)}...
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customers */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium">All Customers ({profiles?.length || 0})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(profiles || []).map((p: any) => {
                  const customerBookings = all.filter(b => b.customer_id === p.id)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{p.full_name || 'No name'}</td>
                      <td className="px-6 py-4 text-gray-500">{p.email}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(p.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium bg-brand-50 text-brand-500 px-2 py-1 rounded-full">
                          {customerBookings.length} booking{customerBookings.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
