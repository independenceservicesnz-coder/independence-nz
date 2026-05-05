'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/account', label: 'Overview', icon: '📊', exact: true },
  { href: '/account/bookings', label: 'My Bookings', icon: '📋' },
  { href: '/account/reviews', label: 'My Reviews', icon: '⭐' },
  { href: '/account/saved', label: 'Saved Providers', icon: '❤️' },
  { href: '/account/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/account/settings', label: 'Account Settings', icon: '⚙️' },
  { href: '/account/security', label: 'Security', icon: '🔒' },
]

export default function AccountSidebar({ fullName, email }: { fullName: string; email: string }) {
  const pathname = usePathname()
  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <aside className="w-60 shrink-0 hidden md:block sticky top-24 self-start">
      <div className="card p-5 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-500 font-semibold text-lg flex items-center justify-center shrink-0">{initials}</div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{fullName || 'Your Account'}</p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="w-2 h-2 rounded-full bg-brand-400 inline-block"></span>
          <span className="text-xs text-gray-400">Verified customer</span>
        </div>
      </div>
      <div className="card overflow-hidden">
        {nav.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-50 last:border-0 transition-colors ${active ? 'bg-brand-50 text-brand-500 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span className="w-5 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
