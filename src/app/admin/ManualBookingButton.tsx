'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SERVICES = [
  { name: 'Home Cleaning', price: 85 },
  { name: 'Deep Clean', price: 150 },
  { name: 'Garden Maintenance', price: 65 },
  { name: 'Handyman Services', price: 75 },
  { name: 'Fitness & Mobility Session', price: 90 },
  { name: 'Personal Care', price: 55 },
  { name: 'Transport & Errands', price: 45 },
]

const PROVIDERS = [
  'Pristine Home Services',
  'Sparkle Clean NZ',
  'Green Thumb Gardens',
  'Kiwi Garden Care',
  'Reliable Handyman Co.',
  'MoveBetter Health',
  'Care Connect NZ',
  'Easy Rides NZ',
]

export default function ManualBookingButton({ customers }: { customers: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    customerId: '',
    serviceName: '',
    providerName: '',
    price: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    address: '',
    notes: '',
    paymentStatus: 'held',
  })
  const router = useRouter()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerId || !form.serviceName || !form.scheduledDate) {
      alert('Please fill in customer, service, and date.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/manual-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          priceCents: Math.round(parseFloat(form.price || '0') * 100),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
          setForm({ customerId: '', serviceName: '', providerName: '', price: '', scheduledDate: '', scheduledTime: '09:00', address: '', notes: '', paymentStatus: 'held' })
          router.refresh()
        }, 1500)
      } else {
        alert(data.error || 'Could not create booking.')
      }
    } catch {
      alert('Error creating booking.')
    }
    setLoading(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        + Add booking manually
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-serif text-xl font-medium">Add booking manually</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {success ? (
              <div className="p-12 text-center">
                <p className="text-5xl mb-4">✅</p>
                <p className="font-serif text-xl font-medium text-brand-500">Booking created!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer *</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" value={form.customerId} onChange={set('customerId')} required>
                    <option value="">Select customer...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name || c.email} — {c.email}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Service *</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" value={form.serviceName}
                      onChange={e => {
                        const svc = SERVICES.find(s => s.name === e.target.value)
                        setForm(f => ({ ...f, serviceName: e.target.value, price: svc ? svc.price.toString() : f.price }))
                      }} required>
                      <option value="">Select service...</option>
                      {SERVICES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" value={form.providerName} onChange={set('providerName')}>
                      <option value="">Select provider...</option>
                      {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (NZD) *</label>
                    <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" placeholder="85.00" value={form.price} onChange={set('price')} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment status</label>
                    <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" value={form.paymentStatus} onChange={set('paymentStatus')}>
                      <option value="pending">Pending</option>
                      <option value="held">Held</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                    <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" value={form.scheduledDate} onChange={set('scheduledDate')} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                    <input type="time" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" value={form.scheduledTime} onChange={set('scheduledTime')} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400" placeholder="123 Example Street, Auckland" value={form.address} onChange={set('address')} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-400 resize-none h-16" placeholder="Any notes about this booking..." value={form.notes} onChange={set('notes')} />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">
                  {loading ? 'Creating booking...' : 'Create booking →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
