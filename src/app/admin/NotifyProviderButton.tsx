'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  customerName: string
  serviceName: string
  scheduledDate: string
  scheduledTime: string
  address: string
  providerName: string
  customerId: string
}

export default function NotifyProviderButton({
  bookingId, customerName, serviceName, scheduledDate,
  scheduledTime, address, providerName, customerId
}: Props) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleNotify = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notify-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          bookingId,
          type: 'provider_coming',
          title: '🚗 Your provider is on the way!',
          body: `${providerName} is confirmed for your ${serviceName} on ${new Date(scheduledDate).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })} at ${scheduledTime?.slice(0, 5)}${address ? ` at ${address}` : ''}. They will arrive at the scheduled time.`,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        router.refresh()
      } else {
        alert(data.error || 'Could not send notification.')
      }
    } catch {
      alert('Error sending notification.')
    }
    setLoading(false)
  }

  if (sent) return <span className="text-xs text-green-600 font-medium">✓ Customer notified</span>

  return (
    <button
      onClick={handleNotify}
      disabled={loading}
      className="text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? 'Sending...' : '🚗 Notify customer'}
    </button>
  )
}
