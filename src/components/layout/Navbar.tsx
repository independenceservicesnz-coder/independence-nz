'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [initials, setInitials] = useState('?')
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        if (data?.full_name) {
          setName(data.full_name.split(' ')[0])
          setInitials(data.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2))
        }
      }
    }
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="font-serif text-xl font-semibold text-brand-500 shrink-0">
          Independence<span className="text-amber-400">NZ</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <Link href="/browse" className="text-sm text-gray-600 hover:text-brand-500 transition-colors">Browse Services</Link>
          <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-brand-500 transition-colors">How it works</Link>
          <Link href="/providers" className="text-sm text-gray-600 hover:text-brand-500 transition-colors">For Providers</Link>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-500 text-xs font-semibold flex items-center justify-center">{initials}</div>
                <span className="text-sm font-medium text-gray-700">{name || 'Account'}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                  <Link href="/account" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">👤 My Account</Link>
                  <Link href="/account/bookings" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">📋 My Bookings</Link>
                  <Link href="/account/settings" onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">⚙️ Settings</Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={signOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left">🚪 Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-brand-500 font-medium transition-colors">Sign in</Link>
              <Link href="/browse" className="btn-primary">Book a Service</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden ml-auto p-2 text-gray-500">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <Link href="/browse" className="text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>Browse Services</Link>
          <Link href="/how-it-works" className="text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>How it works</Link>
          <Link href="/providers" className="text-sm text-gray-700 py-2" onClick={() => setMobileOpen(false)}>For Providers</Link>
          {user ? (
            <>
              <Link href="/account" className="text-sm text-brand-500 font-medium py-2" onClick={() => setMobileOpen(false)}>My Account</Link>
              <button onClick={signOut} className="text-sm text-red-500 text-left py-2">Sign out</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" className="btn-secondary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/browse" className="btn-primary flex-1 justify-center" onClick={() => setMobileOpen(false)}>Book now</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
