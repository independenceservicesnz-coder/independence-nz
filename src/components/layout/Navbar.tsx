'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const accountRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    let currentUserId: string | null = null

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      currentUserId = user?.id ?? null
      if (user) {
        const [{ data: prof }, { data: notifs }] = await Promise.all([
          supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
          supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        ])
        setProfile(prof)
        setNotifications(notifs || [])
        setUnreadCount((notifs || []).filter((n: any) => !n.is_read).length)
      }
      setLoading(false)
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      currentUserId = session?.user?.id ?? null
      if (!session?.user) { setProfile(null); setNotifications([]) }
      else load()
    })

    // Real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        if (payload.new.user_id === currentUserId) {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setAccountOpen(false)
    setNotifOpen(false)
  }, [pathname])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const markAllRead = async () => {
    if (!user) return
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const firstName = profile?.full_name?.split(' ')[0] || 'Account'

  const notifIcon = (type: string) => {
    if (type === 'booking_confirmed') return '✅'
    if (type === 'booking_pending') return '⏳'
    if (type === 'provider_coming') return '🚗'
    if (type === 'service_completed') return '🎉'
    if (type === 'payment_released') return '💳'
    if (type === 'payment_failed') return '❌'
    return '🔔'
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="font-serif text-xl font-semibold text-brand-500 shrink-0">
          Independence<span className="text-blue-500">NZ</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <Link href="/browse" className={`text-sm transition-colors ${pathname === '/browse' ? 'text-brand-500 font-medium' : 'text-gray-600 hover:text-brand-500'}`}>
            Browse Services
          </Link>
          <Link href="/how-it-works" className={`text-sm transition-colors ${pathname === '/how-it-works' ? 'text-brand-500 font-medium' : 'text-gray-600 hover:text-brand-500'}`}>
            How it works
          </Link>
          <Link href="/providers" className={`text-sm transition-colors ${pathname === '/providers' ? 'text-brand-500 font-medium' : 'text-gray-600 hover:text-brand-500'}`}>
            For Providers
          </Link>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {!loading && user ? (
            <>
              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setAccountOpen(false) }}
                  className="relative w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                >
                  <span className="text-lg">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="font-medium text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-brand-500 hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-2xl mb-2">🔔</p>
                          <p className="text-sm text-gray-400">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-brand-50/50' : ''}`}
                          >
                            <span className="text-lg shrink-0 mt-0.5">{notifIcon(n.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium leading-relaxed ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {n.title}
                              </p>
                              {n.body && (
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                              )}
                              <p className="text-xs text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                            </div>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0 mt-1.5"></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      href="/account/bookings"
                      className="flex items-center justify-center gap-1 px-4 py-3 text-xs text-brand-500 font-medium hover:bg-gray-50 border-t border-gray-100 transition-colors"
                      onClick={() => setNotifOpen(false)}
                    >
                      View my bookings →
                    </Link>
                  </div>
                )}
              </div>

              {/* Account dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  onClick={() => { setAccountOpen(!accountOpen); setNotifOpen(false) }}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-500 text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{firstName}</span>
                  <span className="text-gray-400 text-xs">▾</span>
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
                    {/* Profile header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-700">{profile?.full_name || 'My Account'}</p>
                      <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                    </div>

                    {/* Nav items */}
                    <div className="py-1">
                      <Link href="/account" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="w-5 text-center">📊</span> Overview
                      </Link>
                      <Link href="/account/bookings" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="w-5 text-center">📋</span> My Bookings
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/account/notifications" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="w-5 text-center">🔔</span> Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/account/settings" onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="w-5 text-center">⚙️</span> Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button onClick={signOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left transition-colors">
                        <span className="w-5 text-center">🚪</span> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : !loading ? (
            <>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-brand-500 font-medium transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link href="/browse" className="btn-primary">
                Book a Service
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <Link href="/browse" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            🔍 Browse Services
          </Link>
          <Link href="/how-it-works" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            ℹ️ How it works
          </Link>
          <Link href="/providers" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            🏢 For Providers
          </Link>

          {user ? (
            <>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-500 text-sm font-bold flex items-center justify-center">{initials}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{profile?.full_name}</p>
                    <p className="text-xs text-gray-400">{profile?.email}</p>
                  </div>
                </div>
                <Link href="/account" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                  📊 Overview
                </Link>
                <Link href="/account/bookings" className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-3">📋 My Bookings</span>
                  {unreadCount > 0 && <span className="bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </Link>
                <Link href="/account/notifications" className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                  <span className="flex items-center gap-3">🔔 Notifications</span>
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </Link>
                <Link href="/account/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                  ⚙️ Settings
                </Link>
                <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 rounded-xl hover:bg-red-50 w-full text-left mt-1">
                  🚪 Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-100 pt-3 mt-3 flex gap-3">
              <Link href="/auth/login" className="flex-1 btn-secondary justify-center" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/browse" className="flex-1 btn-primary justify-center" onClick={() => setMobileOpen(false)}>Book now</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
