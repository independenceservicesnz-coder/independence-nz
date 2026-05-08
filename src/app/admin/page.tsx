'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import ReleasePaymentButton from './ReleasePaymentButton'
import NotifyProviderButton from './NotifyProviderButton'
import ManualBookingButton from './ManualBookingButton'

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const supabase = createClient()

  const loadData = async () => {
    // Get bookings
    const { data: rawBookings } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    // Get profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .order('created_at', { ascending: false })

    const allProfiles = profiles || []

    // Merge profiles into bookings
    const merged = (rawBookings || []).map((b: any) => ({
      ...b,
      profiles: allProfiles.find((p: any) => p.id === b.customer_id) || null
    }))

    setBookings(merged)
    setCustomers(allProfiles)
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    // Real-time subscription for bookings
    const bookingsChannel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
      }, () => {
        console.log('Booking changed — refreshing...')
        loadData()
      })
      .subscribe()

    // Real-time subscription for new customers
    const profilesChannel = supabase
      .channel('admin-profiles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
      }, () => {
        console.log('Profile changed — refreshing...')
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(profilesChannel)
    }
  }, [])

  const pending = bookings.filter(b => b.status === 'pending')
  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const completed = bookings.filter(b => b.status === 'completed')
  const heldRevenue = bookings.filter(b => b.payment_status === 'held').reduce((s, b) => s + (b.amount_cents || 0), 0)
  const paidRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.amount_cents || 0), 0)

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
    confirmed: { label: 'Confirmed', bg: 'bg-brand-50', text: 'text-brand-500' },
    in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-600' },
    completed: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-500' },
  }

  const paymentConfig: Record<string, { label: string; text: string }> = {
    pending: { label: 'Awaiting payment', text: 'text-amber-600' },
    held: { label: '🔒 Payment held', text: 'text-brand-500' },
    paid: { label: '✅ Released', text: 'text-gray-400' },
    failed: { label: '❌ Failed', text: 'text-red-500' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7]">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-brand-100 border-t-brand-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium">Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
              <p className="text-gray-400 text-xs">
                Live · Updated {lastUpdated.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="btn-secondary text-sm"
            >
              ↻ Refresh
            </button>
            <ManualBookingButton customers={customers} />
            <a href="https://dashboard.stripe.com" target="_blank"
              className="btn-secondary text-sm">
              Open Stripe →
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="font-serif text-3xl font-medium">{bookings.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total bookings</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 text-center">
            <p className="font-serif text-3xl font-medium text-amber-700">{pending.length}</p>
            <p className="text-xs text-amber-600 mt-1">Pending</p>
          </div>
          <div className="bg-brand-50 rounded-xl border border-brand-100 p-4 text-center">
            <p className="font-serif text-3xl font-medium text-brand-500">{confirmed.length}</p>
            <p className="text-xs text-brand-500 mt-1">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="font-serif text-3xl font-medium">{completed.length}</p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="font-serif text-3xl font-medium">{customers.length}</p>
            <p className="text-xs text-gray-400 mt-1">Customers</p>
          </div>
          <div className="bg-brand-50 rounded-xl border border-brand-100 p-4 text-center">
            <p className="font-serif text-2xl font-medium text-brand-500">${(heldRevenue / 100).toFixed(0)}</p>
            <p className="text-xs text-brand-500 mt-1">Held (NZD)</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="font-serif text-2xl font-medium">${(paidRevenue / 100).toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-1">Released (NZD)</p>
          </div>
        </div>

        {/* Action needed */}
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <h2 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
              ⚠️ Action needed — {pending.length} booking{pending.length !== 1 ? 's' : ''} awaiting confirmation
            </h2>
            <div className="space-y-3">
              {pending.map((b: any) => (
                <div key={b.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">{b.profiles?.full_name || 'Customer'}</p>
                    <p className="text-xs text-gray-400">{b.profiles?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {b.service_name} · {b.provider_name} · {new Date(b.scheduled_date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })} at {b.scheduled_time?.slice(0, 5)}
                    </p>
                    <p className="text-xs font-semibold text-brand-500 mt-0.5">${(b.amount_cents / 100).toFixed(2)} NZD</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <NotifyProviderButton
                      bookingId={b.id}
                      customerName={b.profiles?.full_name}
                      serviceName={b.service_name}
                      scheduledDate={b.scheduled_date}
                      scheduledTime={b.scheduled_time}
                      address={b.address}
                      providerName={b.provider_name}
                      customerId={b.customer_id}
                    />
                    <ReleasePaymentButton
                      bookingId={b.id}
                      stripePaymentIntentId={b.stripe_payment_intent_id}
                      amount={(b.amount_cents / 100).toFixed(2)}
                      status={b.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed bookings */}
        {confirmed.length > 0 && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-6">
            <h2 className="font-medium text-brand-700 mb-3 flex items-center gap-2">
              🔒 {confirmed.length} confirmed — payment held, release when service complete
            </h2>
            <div className="space-y-3">
              {confirmed.map((b: any) => (
                <div key={b.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">{b.profiles?.full_name || 'Customer'}</p>
                    <p className="text-xs text-gray-400">{b.profiles?.email}</p>
                    {b.profiles?.phone && <p className="text-xs text-gray-400">{b.profiles.phone}</p>}
                    <p className="text-xs text-gray-500 mt-1">{b.service_name} · {b.provider_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(b.scheduled_date).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })} at {b.scheduled_time?.slice(0, 5)}
                    </p>
                    {b.address && <p className="text-xs text-gray-400 mt-0.5">📍 {b.address}</p>}
                    <p className="text-xs font-semibold text-brand-500 mt-0.5">${(b.amount_cents / 100).toFixed(2)} NZD · Payment held</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <NotifyProviderButton
                      bookingId={b.id}
                      customerName={b.profiles?.full_name}
                      serviceName={b.service_name}
                      scheduledDate={b.scheduled_date}
                      scheduledTime={b.scheduled_time}
                      address={b.address}
                      providerName={b.provider_name}
                      customerId={b.customer_id}
                    />
                    <ReleasePaymentButton
                      bookingId={b.id}
                      stripePaymentIntentId={b.stripe_payment_intent_id}
                      amount={(b.amount_cents / 100).toFixed(2)}
                      status={b.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-medium">All Bookings ({bookings.length})</h2>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
              Live updates
            </span>
          </div>
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No bookings yet. When customers book they will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Service</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map(b => {
                    const status = statusConfig[b.status] || { label: b.status, bg: 'bg-gray-100', text: 'text-gray-500' }
                    const payment = paymentConfig[b.payment_status] || { label: b.payment_status, text: 'text-gray-400' }
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium">{b.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{b.profiles?.email}</p>
                          {b.profiles?.phone && <p className="text-xs text-gray-400">{b.profiles.phone}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{b.service_name}</p>
                          <p className="text-xs text-gray-400">{b.provider_name}</p>
                          {b.address && <p className="text-xs text-gray-300 mt-0.5">📍 {b.address}</p>}
                          {b.notes && <p className="text-xs text-gray-300 italic mt-0.5">"{b.notes}"</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {new Date(b.scheduled_date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-400">{b.scheduled_time?.slice(0, 5)}</p>
                          <p className="text-xs text-gray-300 mt-0.5">
                            Booked {new Date(b.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-brand-500">${(b.amount_cents / 100).toFixed(2)}</p>
                          <p className="text-xs text-gray-400">NZD</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className={`text-xs font-medium ${payment.text}`}>{payment.label}</p>
                          {b.stripe_payment_intent_id && (
                            <p className="text-xs text-gray-300 mt-0.5 font-mono">{b.stripe_payment_intent_id.slice(0, 14)}...</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            {b.status === 'confirmed' && (
                              <ReleasePaymentButton
                                bookingId={b.id}
                                stripePaymentIntentId={b.stripe_payment_intent_id}
                                amount={(b.amount_cents / 100).toFixed(2)}
                                status={b.status}
                              />
                            )}
                            {b.profiles?.email && (
                              <a href={`mailto:${b.profiles.email}`} className="text-xs text-brand-500 hover:underline">
                                Email customer
                              </a>
                            )}
                            {b.profiles?.phone && (
                              <a href={`tel:${b.profiles.phone}`} className="text-xs text-brand-500 hover:underline">
                                Call customer
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-medium">All Customers ({customers.length})</h2>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
              Live updates
            </span>
          </div>
          {customers.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No customers yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bookings</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((p: any) => {
                    const customerBookings = bookings.filter(b => b.customer_id === p.id)
                    const totalSpent = customerBookings
                      .filter(b => b.payment_status === 'paid')
                      .reduce((s: number, b: any) => s + (b.amount_cents || 0), 0)
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium">{p.full_name || 'No name set'}</td>
                        <td className="px-5 py-4">
                          <p className="text-gray-600">{p.email}</p>
                          {p.phone && <p className="text-xs text-gray-400 mt-0.5">{p.phone}</p>}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">
                          {new Date(p.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium bg-brand-50 text-brand-500 px-2 py-1 rounded-full">
                            {customerBookings.length} booking{customerBookings.length !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {totalSpent > 0 ? (
                            <span className="font-medium text-brand-500">${(totalSpent / 100).toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
