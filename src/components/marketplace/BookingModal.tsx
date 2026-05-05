'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  providerName: string
  serviceName: string
  price: number
}

const slots = [
  { time: '9:00 AM', date: 'Tomorrow' },
  { time: '1:00 PM', date: 'Tomorrow' },
  { time: '9:00 AM', date: 'Thu 17 Jul' },
  { time: '11:00 AM', date: 'Thu 17 Jul' },
  { time: '9:00 AM', date: 'Fri 18 Jul' },
  { time: '2:00 PM', date: 'Fri 18 Jul' },
]

export default function BookingModal({ providerName, serviceName, price }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(0)
  const router = useRouter()

  return (
    <>
      <button onClick={e => { e.preventDefault(); setOpen(true) }}
        className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
        Book now
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-2xl md:rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg font-medium">Book {providerName}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 mb-3">Choose a time</p>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s, i) => (
                  <button key={i} onClick={() => setSelectedSlot(i)}
                    className={`border rounded-lg p-2.5 text-center transition-all ${selectedSlot === i ? 'border-brand-400 bg-brand-50 text-brand-500' : 'border-gray-200 hover:border-brand-300'}`}>
                    <div className="text-xs font-medium">{s.time}</div>
                    <div className="text-xs text-gray-400">{s.date}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex justify-between text-sm text-gray-600 mb-2"><span>{serviceName}</span><span>${price}.00</span></div>
              <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-2 mt-2"><span>Total</span><span>${price}.00</span></div>
              <p className="text-xs text-gray-400 mt-2">💳 Secure payment through Independence NZ</p>
            </div>

            <button onClick={() => router.push('/auth/login?redirect=/account/bookings')}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3.5 rounded-xl transition-colors text-sm">
              Sign in to confirm booking →
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">No charges until confirmed</p>
          </div>
        </div>
      )}
    </>
  )
}
