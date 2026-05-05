'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '', suburb: '', city: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
 const supabase = await createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('full_name, phone, address, suburb, city').eq('id', user.id).single()
      if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '', address: data.address || '', suburb: data.suburb || '', city: data.city || '' })
      setLoading(false)
    }
    load()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ ...profile, updated_at: new Date().toISOString() }).eq('id', user!.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setProfile(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium">Account Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Update your personal details and preferences.</p>
      </div>

      {saved && <div className="bg-brand-50 border border-brand-100 text-brand-600 text-sm rounded-xl px-4 py-3">✓ Profile updated successfully.</div>}

      <form onSubmit={save} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-medium text-sm">Personal details</h2>
          <div>
            <label className="lbl">Full name</label>
            <input type="text" className="inp" value={profile.full_name} onChange={set('full_name')} placeholder="Margaret Smith" />
          </div>
          <div>
            <label className="lbl">Phone number</label>
            <input type="tel" className="inp" value={profile.phone} onChange={set('phone')} placeholder="021 xxx xxxx" />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-medium text-sm">Service address</h2>
          <p className="text-xs text-gray-400">Used to show relevant local providers near you.</p>
          <div>
            <label className="lbl">Street address</label>
            <input type="text" className="inp" value={profile.address} onChange={set('address')} placeholder="123 Example Street" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="lbl">Suburb</label>
              <input type="text" className="inp" value={profile.suburb} onChange={set('suburb')} placeholder="Remuera" />
            </div>
            <div>
              <label className="lbl">City</label>
              <select className="inp" value={profile.city} onChange={set('city')}>
                <option value="">Select city</option>
                {['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="btn-primary disabled:opacity-60">
          {saving ? 'Saving...' : '✓ Save changes'}
        </button>
      </form>
    </div>
  )
}
