'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  providerName: string
  providerId?: string
  serviceName: string
  serviceId?: string
  serviceDescription?: string
  price: number
  buttonLabel?: string
  buttonClass?: string
}

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

export default function BookingModal({
  providerName,
  providerId,
  serviceName,
  serviceId,
  serviceDescription,
  price,
  buttonLabel = 'Book now',
  buttonClass,
}: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'slots' | 'details' | 'processing'>('slots')
  const [selectedSlot, setSelectedSlot] = useState(0)
  const [notes, setNotes] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userLoading, setUserLoading] = useState(true)
  const [hasUser, setHasUser] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setHasUser(!!user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('address, suburb, city')
          .eq('id', user.id)
          .single()
        if (data?.address) {
          setAddress([data.address, data.suburb, data.city].filter(Boolean).join(', '))
        }
      }
      setUserLoading(false)
    }
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasUser(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setStep('slots')
    setError('')
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setStep('slots')
    setError('')
    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!address.trim()) {
      setError('Please enter your service address.')
      return
    }

    // Get fresh session
    const { data: { session } } = await supabase.auth.getSession()
    const currentUser = session?.user

    if (!currentUser) {
      sessionStorage.setItem('bookingIntent', JSON.stringify({
        providerName, providerId, serviceName, serviceId,
        serviceDescription, price, selectedSlot, notes, address,
      }))
      closeModal()
      router.push('/auth/login?redirect=/browse&booking=true')
      return
    }

    setLoading(true)
    setStep('processing')
    setError('')

    try {
      const slot = SLOTS[selectedSlot]
      const scheduledDate = getSlotDate(slot.daysFromNow)

      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', currentUser.id)
        .single()

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerName,
          providerId: providerId || '',
          serviceName,
          serviceId: serviceId || '',
          serviceDescription: serviceDescription || serviceName,
          priceCents: price * 100,
          scheduledDate,
          scheduledTime: slot.time,
          address: address.trim(),
          notes: notes.trim(),
          customerId: currentUser.id,
          customerEmail: freshProfile?.email || currentUser.email || '',
          customerName: freshProfile?.full_name || '',
        }),
      })

      const data = await response.json()
      console.log('Checkout response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (!data.url) {
        throw new Error('No payment URL received. Please try again.')
      }

      window.location.href = data.url

    } catch (err: any) {
      console.error('Booking error:', err)
      setError(err.message || 'Something went wrong. Please call 027 325 9707.')
      setLoading(false)
      setStep('details')
    }
  }

  const btnClass = buttonClass ||
    'bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors'

  return (
    <>
      <button onClick={openModal} className={btnClass}>
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">

            {step === 'processing' && (
              <div className="p-12 text-center">
                <div className="w-14 h-14 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin mx-auto mb-5"></div>
                <p className="font-serif text-xl font-medium text-gray-800 mb-2">
                  Setting up your booking...
                </p>
                <p className="text-sm text-gray-400">
                  Taking you to secure payment. Please don&apos;t close this page.
                </p>
              </div>
            )}

            {step === 'slots' && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif text-xl font-medium">Book {providerName}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {serviceName} · <span className="text-brand-500 font-semibold">${price} NZD</span>
                    </p>
                  </div>
                  <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors">
                    ✕
                  </button>
                </div>

                <div className="p-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">Choose a time that suits you</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {SLOTS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(i)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedSlot === i
                            ? 'border-brand-400 bg-brand-50'
                            : 'border-gray-100 hover:border-brand-200 bg-white'
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

                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
                    <p className="text-xs text-green-700 font-medium text-center">
                      💚 You only pay for the service — no platform fees, no hidden costs
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-5">
                    <p className="text-xs text-amber-700 font-medium mb-0.5">🔒 Protected payment</p>
                    <p className="text-xs text-amber-600">
                      Your card is authorised now but only charged once your service is complete.
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('details')}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-xl transition-colors text-sm"
                  >
                    Continue →
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    Need help? <a href="tel:0273259707" className="text-brand-500">Call 027 325 9707</a>
                  </p>
                </div>
              </>
            )}

            {step === 'details' && (
              <>
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                  <button onClick={() => setStep('slots')} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors">
                    ←
                  </button>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-medium">Confirm booking</h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {SLOTS[selectedSlot].display} · {SLOTS[selectedSlot].time_label}
                    </p>
                  </div>
                  <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm transition-colors">
                    ✕
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">{serviceName}</p>
                        <p className="text-xs text-gray-400">{providerName}</p>
                        <p className="text-xs text-brand-500 mt-0.5">
                          {SLOTS[selectedSlot].display} · {SLOTS[selectedSlot].time_label}
                        </p>
                      </div>
                      <p className="font-bold text-brand-500 text-2xl">${price}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Platform fee</span>
                        <span className="text-brand-500 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Membership fee</span>
                        <span className="text-brand-500 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                        <span>Total to authorise</span>
                        <span className="text-brand-500">${price}.00 NZD</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Service address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors"
                      placeholder="123 Example Street, Remuera, Auckland"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">Where should the provider come?</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 resize-none h-20 transition-colors"
                      placeholder="Access instructions, gate code, special requirements..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  {!userLoading && !hasUser && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-xs text-blue-700 font-medium mb-0.5">👤 Quick sign in needed</p>
                      <p className="text-xs text-blue-600">
                        We will save your booking details and take you to sign in first, then straight to payment.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={loading || !address.trim()}
                    className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-base flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Confirm & Pay $${price}.00 →`
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    🔒 Secure payment by Stripe · Card authorised, not charged until service complete
                  </p>

                  <div className="text-center pt-1">
                    <p className="text-xs text-gray-400">
                      Prefer to book by phone?{' '}
                      <a href="tel:0273259707" className="text-brand-500 font-medium">Call 027 325 9707</a>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
