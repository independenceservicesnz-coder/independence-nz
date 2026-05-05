import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import AccountSidebar from '@/components/account/AccountSidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/account')

  const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <AccountSidebar fullName={profile?.full_name || ''} email={profile?.email || user.email || ''} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
