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

const slots = [
  { time: '9:00 AM', date: 'Tomorrow', value: '09:00' },
  { time: '11:00 AM', date: 'Tomorrow', value: '11:00' },
  { time: '1:00 PM', date: 'Tomorrow', value: '13:00' },
  { time: '9:00 AM', date: 'Thu 17 Jul', value: '09:00' },
  { time: '11:00 AM', date: 'Thu 17 Jul', value: '11:00' },
  { time: '2:00 PM', date: 'Fri 18 Jul', value: '14:00' },
]

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const tomorrowStr = tomorrow.toISOString().split('T')[0]

const slotDates = [
  tomorrowStr,
  tomorrowStr,
  tomorrowStr,
  new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
]

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
  const [selectedSlot, setSelectedSlot] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setChecking(false)
    }
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleBook = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/browse')
      return
    }

    setLoading(true)
    setError('')

    try {
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
          scheduledDate: slotDates[selectedSlot],
          scheduledTime: slots[selectedSlot].value,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Something went wrong')

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const defaultBtnClass = buttonClass || 'bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors'

  return (
    <>
      <button
        onClick={e => {
          e.preventDefault()
          if (!checking && !user) {
            router.push('/auth/login?redirect=/browse')
            return
          }
          setOpen(true)
        }}
        className={defaultBtnClass}
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg font-medium">Confirm your booking</h3>
                <p className="text-xs text-gray-400 mt-0.5">{providerName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Service summary */}
            <div className="bg-brand-50 rounded-xl p-4 mb-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-brand-700">{serviceName}</p>
                {serviceDescription && (
                  <p className="text-xs text-brand-500 mt-0.5">{serviceDescription}</p>
                )}
              </div>
              <p className="font-semibold text-brand-500 text-lg">${price}</p>
            </div>

            {/* Time slots */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Choose a time</p>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(i)}
                    className={`border-2 rounded-xl p-3 text-center transition-all ${
                      selectedSlot === i
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-gray-100 hover:border-brand-200 bg-white'
                    }`}
                  >
                    <div className={`text-xs font-semibold ${selectedSlot === i ? 'text-brand-500' : 'text-gray-700'}`}>
                      {s.time}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.date}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Notes for provider <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 resize-none h-20 font-sans"
                placeholder="Any special requirements, access instructions, or things the provider should know..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Price summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{serviceName}</span>
                <span>${price}.00</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span className="text-brand-500">${price}.00 NZD</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                🔒 Secure payment through Independence NZ
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleBook}
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Taking you to payment...
                </>
              ) : (
                <>
                  Confirm & Pay ${price}.00 →
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              You will be taken to our secure payment page. No charges until confirmed.
            </p>

            {/* Help */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Need help booking?{' '}
                <a href="tel:0273259707" className="text-brand-500 font-medium">Call 027 325 9707</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
