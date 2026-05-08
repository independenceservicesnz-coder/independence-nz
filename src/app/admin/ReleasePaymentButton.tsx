'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  stripePaymentIntentId: string | null
  amount: string
  status: string
}

export default function ReleasePaymentButton({ bookingId, stripePaymentIntentId, amount, status }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  if (status === 'completed') {
    return <span className="text-xs text-gray-400 font-medium">✅ Payment released</span>
  }

  if (!stripePaymentIntentId) {
    return <span className="text-xs text-gray-300">No payment</span>
  }

  const handleRelease = async () => {
    if (!confirm(`Release payment of $${amount} NZD to Independence NZ? This confirms the service is complete.`)) return

    setLoading(true)
    try {
      const res = await fetch('/api/release-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, stripePaymentIntentId }),
      })
      const data = await res.json()
      if (data.success) {
        setDone(true)
        router.refresh()
      } else {
        alert(data.error || 'Could not release payment. Try in Stripe dashboard.')
      }
    } catch {
      alert('Error releasing payment. Please try in Stripe dashboard.')
    }
    setLoading(false)
  }

  if (done) return <span className="text-xs text-brand-500 font-medium">✅ Released!</span>

  return (
    <button
      onClick={handleRelease}
      disabled={loading}
      className="text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? 'Releasing...' : `Release $${amount} →`}
    </button>
  )
}
