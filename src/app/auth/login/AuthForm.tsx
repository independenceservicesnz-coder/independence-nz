'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

type Mode = 'login' | 'signup' | 'magic'

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasBookingIntent, setHasBookingIntent] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/account'
  const hasBooking = params.get('booking') === 'true'
  const supabase = createClient()

  useEffect(() => {
    if (hasBooking && typeof window !== 'undefined') {
      const intent = sessionStorage.getItem('bookingIntent')
      setHasBookingIntent(!!intent)
    }
  }, [hasBooking])

  const handleSuccess = async () => {
    // Check if there's a saved booking intent
    if (typeof window !== 'undefined') {
      const intentStr = sessionStorage.getItem('bookingIntent')
      if (intentStr) {
        // Go back to browse so they can complete the booking
        router.push('/browse?restored=true')
        router.refresh()
        return
      }
    }
    router.push(redirect)
    router.refresh()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
            shouldCreateUser: true,
          }
        })
        if (error) throw error
        setSuccess('Check your email — we sent you a sign-in link!')
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await handleSuccess()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`
          }
        })
        if (error) throw error
        setSuccess('Almost there! Check your email to confirm your account, then come back to sign in.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess('') }

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col">
      <nav className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
        <Link href="/" className="font-serif text-xl font-semibold text-brand-500">
          Independence<span className="text-blue-500">NZ</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="font-serif text-2xl font-semibold text-brand-500">
              Independence<span className="text-blue-500">NZ</span>
            </Link>
            <p className="text-sm text-gray-400 mt-1">Trusted home services marketplace</p>
          </div>

          {/* Booking intent notice */}
          {hasBookingIntent && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-5 text-center">
              <p className="text-sm font-medium text-brand-700 mb-0.5">🎉 Almost there!</p>
              <p className="text-xs text-brand-600">Sign in to complete your booking. We have saved your details.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {mode !== 'magic' && (
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
                {(['login', 'signup'] as Mode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      mode === m ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {m === 'login' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-brand-50 border border-brand-100 text-brand-600 text-sm rounded-xl px-4 py-3 mb-4 leading-relaxed">
                {success}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'magic' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm text-gray-400 hover:text-brand-500 flex items-center gap-2 mb-2"
                >
                  ← Back to sign in
                </button>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="lbl">Full name</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="Margaret Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="lbl">Email address</label>
                <input
                  type="email"
                  className="inp"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {mode !== 'magic' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="lbl" style={{ marginBottom: 0 }}>Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('magic')}
                        className="text-xs text-brand-500 hover:text-brand-600"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="inp pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'magic' && (
                <p className="text-sm text-gray-500 leading-relaxed">
                  Enter your email and we&apos;ll send you a secure link to sign in — no password needed.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {mode === 'login'
                  ? hasBookingIntent ? 'Sign in & complete booking →' : 'Sign in →'
                  : mode === 'signup'
                  ? 'Create my account →'
                  : 'Send me a sign-in link →'}
              </button>
            </form>

            {mode !== 'magic' && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => switchMode('magic')}
                  className="text-sm text-gray-400 hover:text-brand-500 transition-colors"
                >
                  Sign in without a password →
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mt-4 text-center">
                  <p className="text-xs text-brand-600 font-medium">
                    💚 Free to join — you only ever pay for the services you book
                  </p>
                </div>
                <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                  By creating an account you agree to our{' '}
                  <Link href="/terms" className="text-brand-500">Terms</Link> and{' '}
                  <Link href="/privacy" className="text-brand-500">Privacy Policy</Link>.
                </p>
              </>
            )}
          </div>

          {/* Phone helpline */}
          <div className="mt-5 bg-white rounded-xl border border-gray-100 p-5 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Prefer to book by phone?</p>
            <p className="text-xs text-gray-400 mb-3">Our friendly NZ-based team can book a service for you.</p>
            <a
              href="tel:0273259707"
              className="inline-flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-500 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              📞 Call 027 325 9707
            </a>
            <p className="text-xs text-gray-400 mt-2">Mon–Fri 8am–6pm · Sat 9am–3pm</p>
          </div>

          <div className="flex justify-center gap-6 mt-5 text-xs text-gray-400">
            <span>🔒 Encrypted & secure</span>
            <span>✓ NZ-based platform</span>
            <span>★ Trusted marketplace</span>
          </div>
        </div>
      </div>
    </div>
  )
}
