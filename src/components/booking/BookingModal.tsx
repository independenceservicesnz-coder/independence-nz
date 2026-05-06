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
  { display: 'Tomorrow · 9:00 AM', date: 1, time: '09:00' },
  { display: 'Tomorrow · 11:00 AM', date: 1, time: '11:00' },
  { display: 'Tomorrow · 1:00 PM', date: 1, time: '13:00' },
  { display: 'Tomorrow · 3:00 PM', date: 1, time: '15:00' },
  { display: 'In 2 days · 9:00 AM', date: 2, time: '09:00' },
  { display: 'In 2 days · 1:00 PM', date: 2, time: '13:00' },
  { display: 'In 3 days · 9:00 AM', date: 3, time: '09:00' },
  { display: 'In 3 days · 2:00 PM', date: 3, time: '14:00' },
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
  const [step, setStep] = useState<'slots' | 'details' | 'loading'>('slots')
  const [selectedSlot, setSelectedSlot] = useState(0)
  const [notes, setNotes] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setUserLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load saved address from profile
  useEffect(() => {
    if (user && open) {
      supabase.from('profiles').select('address, suburb, city').eq('id', user.id).single().then(({ data }) => {
        if (data?.address) {
          setAddress([data.address, data.suburb, data.city].filter(Boolean).join(', '))
        }
      })
    }
  }, [user, open])

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setStep('slots')
    setError('')
    setOpen(true)
  }

  const handleConfirm = async () => {
    // If not signed in — save booking intent and redirect to login
    if (!user) {
      const intent = {
        providerName, providerId, serviceName, serviceId,
        serviceDescription, price, selectedSlot, notes, address,
      }
      sessionStorage.setItem('bookingIntent', JSON.stringify(intent))
      router.push('/auth/login?redirect=/browse&booking=true')
      setOpen(false)
      return
    }

    setLoading(true)
    setStep('loading')
    setError('')

    try {
      const slot = SLOTS[selectedSlot]
      const scheduledDate = getSlotDate(slot.date)

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
          address,
          notes,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again or call us on 027 325 9707.')
      setLoading(false)
      setStep('details')
    }
  }

  const btnClass = buttonClass || 'bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors'

  return (
    <>
      <button onClick={openModal} className={btnClass}>
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setStep('slots') } }}
        >
          <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">

            {/* Loading state */}
            {step === 'loading' && (
              <div className="p-10 text-center">
                <div className="w-12 h-12 border-3 border-brand-100 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }}></div>
                <p className="font-medium text-gray-700 mb-1">Setting up your booking...</p>
                <p className="text-sm text-gray-400">Taking you to secure payment</p>
              </div>
            )}

            {/* Step 1 - Select time slot */}
            {step === 'slots' && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif text-xl font-medium">Book {providerName}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{serviceName} · <span className="text-brand-500 font-medium">${price} NZD</span></p>
                  </div>
                  <button onClick={() => { setOpen(false); setStep('slots') }}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    ✕
                  </button>
                </div>

                <div className="p-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">Choose a time that works for you</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {SLOTS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(i)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedSlot === i
                            ? 'border-brand-400 bg-brand-50'
                            : 'border-gray-100 hover:border-brand-200'
                        }`}
                      >
                        <p className={`text-sm font-medium ${selectedSlot === i ? 'text-brand-600' : 'text-gray-700'}`}>
                          {s.display.split(' · ')[0]}
                        </p>
                        <p className={`text-xs mt-0.5 ${selectedSlot === i ? 'text-brand-500' : 'text-gray-400'}`}>
                          {s.display.split(' · ')[1]}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5">
                    <p className="text-xs text-green-700 font-medium text-center">
                      💚 You only pay for the service — no platform fees, no hidden costs
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('details')}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 rounded-xl transition-colors text-sm"
                  >
                    Continue →
                  </button>

                  <p className="text-xs text-gray-400 text-center mt-3">
                    Need help? Call <a href="tel:0273259707" className="text-brand-500">027 325 9707</a>
                  </p>
                </div>
              </>
            )}

            {/* Step 2 - Details and payment */}
            {step === 'details' && (
              <>
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                  <button onClick={() => setStep('slots')}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors text-sm">
                    ←
                  </button>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-medium">Confirm booking</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{SLOTS[selectedSlot].display}</p>
                  </div>
                  <button onClick={() => { setOpen(false); setStep('slots') }}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                    ✕
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Booking summary */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-sm">{serviceName}</p>
                        <p className="text-xs text-gray-400">{providerName}</p>
                        <p className="text-xs text-brand-500 mt-0.5">{SLOTS[selectedSlot].display}</p>
                      </div>
                      <p className="font-bold text-brand-500 text-xl">${price}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-3 space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Platform fee</span>
                        <span className="text-brand-500 font-semibold">FREE</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Membership fee</span>
                        <span className="text-brand-500 font-semibold">FREE</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-brand-500">${price}.00 NZD</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
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
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notes for provider <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 resize-none h-20 transition-colors"
                      placeholder="Access instructions, special requirements, anything the provider should know..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Payment hold notice */}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-xs text-amber-700 font-medium mb-0.5">🔒 Your payment is protected</p>
                    <p className="text-xs text-amber-600 leading-relaxed">
                      Your card is authorised now but only charged once your service is complete and you are happy.
                    </p>
                  </div>

                  {/* Not signed in notice */}
                  {!userLoading && !user && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-xs text-blue-700 font-medium mb-0.5">👤 You will be asked to sign in</p>
                      <p className="text-xs text-blue-600 leading-relaxed">
                        We will save your booking details and take you to sign in, then straight to payment. Quick and easy.
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
                    disabled={loading || !address}
                    className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
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
                    Secure payment powered by Stripe · Need help?{' '}
                    <a href="tel:0273259707" className="text-brand-500">Call 027 325 9707</a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
