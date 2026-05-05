'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ReviewButton({ bookingId, providerId }: { bookingId: string; providerId: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const submit = async () => {
    if (!rating) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('reviews').insert({ booking_id: bookingId, provider_id: providerId, customer_id: user!.id, rating, comment })
    setLoading(false); setDone(true)
    setTimeout(() => { setOpen(false); router.refresh() }, 1500)
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent!']

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
        ★ Leave a review
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            {done ? (
              <div className="text-center py-6">
                <p className="text-5xl mb-3">⭐</p>
                <p className="font-serif text-xl font-medium text-brand-500 mb-1">Thanks for your review!</p>
                <p className="text-sm text-gray-400">Your feedback helps others find the best providers.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-lg font-medium">Rate your service</h3>
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <div className="flex gap-1 justify-center mb-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}
                      className="text-4xl transition-transform hover:scale-110 leading-none">
                      <span className={(hover || rating) >= n ? 'text-amber-400' : 'text-gray-200'}>★</span>
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-400 mb-4">{labels[hover || rating] || 'Tap to rate'}</p>
                <textarea className="inp resize-none h-20 mb-4" placeholder="Tell others what you thought..." value={comment} onChange={e => setComment(e.target.value)} />
                <button onClick={submit} disabled={!rating || loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors text-sm">
                  {loading ? 'Submitting...' : 'Submit review'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
