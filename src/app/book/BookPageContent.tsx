'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

const SLOTS = [
  { display: 'Tomorrow', time_label: '9:00 AM', daysFromNow: 1, time: '09:00' },
  { display: 'Tomorrow', time_label: '11:00 AM', daysFromNow: 1, time: '11:00' },
  { display: 'Tomorrow', time_label: '1:00 PM', daysFromNow: 1, time: '13:00' },
  { display: 'Tomorrow', time_label: '3:00 PM', daysFromNow: 1, time: '15:00' },
  { display: 'In 2 days', time_label: '9:00 AM', daysFromNow: 2, time: '09:00' },
  { display: 'In 2 days', time_label: '1:00 PM', daysFromNow: 2, time: '13:00' },
  { display: 'In 3 days', time_label: '9:00 AM', daysFromNow: 3, time: '09:00' },
  { display: 'In 3 days', time_label: '2:00 PM', daysFromNow: 3, time: '14:00' },
]

function getSlotDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

export default function BookPageContent() {
  const [selectedSlot, setSelectedSlot] = useState(0)
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const providerName = params.get('provider') || 'Service Provider'
  const serviceName = params.get('service') || 'Home Service'
  const price = parseInt(params.get('price') || '85')
  const providerId = params.get('providerId') || ''

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('address, suburb, city, full_name, email')
          .eq('id', session.user.id)
          .single()
        if (data?.address) {
          setAddress([data.address, data.suburb, data.city].filter(Boolean).join(', '))
        }
      }
      setChecking(false)
    }
    load()
  }, [])

  const handlePay = async () => {
    if (!user) {
      const returnUrl = `/book?provider=${encodeURIComponent(providerName)}&service=${encodeURIComponent(serviceName)}&price=${price}&providerId=${providerId}`
      router.push('/auth/login?redirect=' + encodeURIComponent(returnUrl))
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()

      const slot = SLOTS[selectedSlot]
      const scheduledDate = getSlotDate(slot.daysFromNow)

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          customerEmail: profile?.email || user.email || '',
          customerName: profile?.full_name || '',
          providerName,
          providerId,
          serviceName,
          priceCents: price * 100,
          scheduledDate,
          scheduledTime: slot.time,
          address: address || 'To be confirmed',
          notes,
        }),
      })

      const data = await res.json()
      console.log('Checkout response:', data)

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong. Please call 027 325 9707.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please call 027 325 9707.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10 w-full">
        <Link href="/browse" className="text-sm text-gray-400 hover:text-brand-500 flex items-center gap-2 mb-6">
          ← Back to browse
        </Link>

        <h1 className="font-serif text-3xl font-medium mb-1">Book {providerName}</h1>
        <p className="text-gray-400 text-sm mb-8">
          {serviceName} · <span className="text-brand-500 font-semibold">${price} NZD</span>
        </p>

        {!user && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-blue-700 mb-1">👤 Sign in to complete your booking</p>
            <p className="text-xs text-blue-600 mb-3">Free to join — you only pay for the service.</p>
            <button
              onClick={handlePay}
              className="text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg transition-colors"
            >
              Sign in to book →
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="font-medium text-sm mb-4">Choose a time</h2>
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedSlot(i)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedSlot === i
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-gray-100 hover:border-brand-200'
                }`}
              >
                <p className={`text-sm font-semibold ${selectedSlot === i ? 'text-brand-600' : 'text-gray-700'}`}>
                  {s.display}
                </p>
                <p className={`text-xs mt-0.5 ${selectedSlot === i ? 'text-brand-500' : 'text-gray-400'}`}>
                  {s.time_label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="font-medium text-sm mb-4">Service address</h2>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors"
            placeholder="123 Example Street, Auckland"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-2">Where should the provider come?</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
          <h2 className="font-medium text-sm mb-4">Notes <span className="text-gray-400 font-normal">(optional)</span></h2>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 resize-none h-20 transition-colors"
            placeholder="Access instructions, gate code, special requirements..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h2 className="font-medium text-sm mb-4">Order summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{serviceName}</span>
              <span>${price}.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform fee</span>
              <span className="text-brand-500 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Membership fee</span>
              <span className="text-brand-500 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
              <span>Total to authorise</span>
              <span className="text-brand-500">${price}.00 NZD</span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-4">
            <p className="text-xs text-amber-700 font-medium mb-0.5">🔒 Protected payment</p>
            <p className="text-xs text-amber-600">Your card is authorised now but only charged once your service is complete.</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 mt-2">
            <p className="text-xs text-green-700 font-medium text-center">💚 You only pay for the service — no platform fees, no hidden costs</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-5 rounded-xl transition-colors text-lg flex items-center justify-center gap-3 shadow-lg"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Taking you to payment...
            </>
          ) : (
            <>🔒 Confirm and Pay ${price}.00 →</>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Secure payment by Stripe · Need help? <a href="tel:0273259707" className="text-brand-500">Call 027 325 9707</a>
        </p>
      </div>
    </div>
  )
}
