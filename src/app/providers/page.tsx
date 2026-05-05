'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const benefits = [
  { icon: '📈', title: 'Consistent bookings', desc: 'Access a steady stream of recurring local customers who need your services' },
  { icon: '💳', title: 'Zero commission', desc: 'Keep 100% of every service payment. We earn from subscriptions, not your work' },
  { icon: '⭐', title: 'Build your reputation', desc: 'Verified star ratings and reviews attract more customers automatically' },
  { icon: '💰', title: 'Payments handled', desc: 'Customers pay through Independence NZ. You receive payment promptly' },
  { icon: '🏆', title: 'Premium visibility', desc: 'Your profile appears across our trusted marketplace reaching families who need you' },
  { icon: '🛡️', title: 'Trusted brand', desc: 'Our verified badge tells customers you have been background checked and approved' },
]

const includes = [
  'Listed on the Independence NZ marketplace',
  'Receive and manage customer bookings',
  'Secure payment processing through platform',
  'Build verified star ratings and reviews',
  'Full provider profile with photos and bio',
  'Keep 100% of service earnings',
  '0% commission on any booking',
  'Cancel anytime',
]

const faqs = [
  { q: 'Do I pay commission on bookings?', a: 'No — never. You pay a flat $99/month subscription and keep 100% of every service payment.' },
  { q: 'How does payment work?', a: 'Customers pay through Independence NZ. Once a booking is completed, payment is released to you within 2 business days.' },
  { q: 'Can I cancel my subscription?', a: 'Yes. Cancel anytime with no penalty. Your listing stays active until the end of your billing period.' },
  { q: 'What is the vetting process?', a: 'We verify your business registration, insurance, and conduct a police background check to keep our platform trusted.' },
  { q: 'Is there a free trial?', a: 'Yes — approved providers get 30 days free before their first billing cycle begins.' },
]

export default function ProvidersPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', business: '', email: '', phone: '', category: '', city: '', bio: '', agreed: false })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-block bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1 rounded-full text-sm mb-5">For service providers</div>
          <h1 className="font-serif text-5xl font-medium mb-4 leading-tight">Grow your business with<br />Independence NZ</h1>
          <p className="text-lg text-white/80 max-w-md mx-auto mb-8">Access consistent local customers through our trusted marketplace — for one flat monthly fee. Keep 100% of what you earn.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#apply" className="btn-white">Apply to join →</a>
            <a href="#how" className="border border-white/40 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">Learn more</a>
          </div>
          <div className="flex justify-center gap-8 mt-10 pt-10 border-t border-white/15 text-sm text-white/70 flex-wrap">
            {['No commission on bookings', 'Flat $99/month', 'Cancel anytime', '200+ active providers'].map(t => (
              <span key={t}>✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <h2 className="font-serif text-3xl font-medium text-center mb-10">Why providers choose Independence NZ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {benefits.map(b => (
            <div key={b.title} className="card p-6 text-center">
              <div className="text-4xl mb-4">{b.icon}</div>
              <h3 className="font-medium mb-2">{b.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border-t border-b border-gray-100 py-16">
        <div className="max-w-md mx-auto px-4">
          <h2 className="font-serif text-3xl font-medium text-center mb-2">Simple pricing</h2>
          <p className="text-center text-gray-400 mb-10">One flat fee. No commission. No surprises.</p>
          <div className="border-2 border-brand-400 rounded-2xl p-8 shadow-lg">
            <div className="inline-block bg-brand-50 text-brand-500 text-xs font-semibold px-3 py-1 rounded-full mb-4">Standard plan</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-5xl font-medium text-brand-500">$99</span>
              <span className="text-gray-400">NZD / month</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">Everything you need to grow your service business</p>
            <div className="space-y-2 mb-8">
              {includes.map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-brand-500 font-semibold shrink-0">✓</span> {item}
                </div>
              ))}
            </div>
            <a href="#apply" className="btn-primary w-full justify-center py-3.5 text-base">Apply to join →</a>
            <p className="text-xs text-gray-400 text-center mt-3">All providers vetted · 30-day free trial</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-2xl mx-auto px-4 py-16 w-full" id="how">
        <h2 className="font-serif text-3xl font-medium text-center mb-10">How to get started</h2>
        <div className="space-y-4">
          {[
            { n: '1', t: 'Apply to join', d: 'Fill out the application below. We review every application within 2 business days.' },
            { n: '2', t: 'Verification', d: 'We verify your credentials, insurance, and conduct a background check.' },
            { n: '3', t: 'Set up your profile', d: 'Add your services, pricing, availability, photos, and bio.' },
            { n: '4', t: 'Start receiving bookings', d: 'Go live and start receiving customer bookings. Payments handled by Independence NZ.' },
          ].map(s => (
            <div key={s.n} className="card p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-serif text-lg font-semibold flex items-center justify-center shrink-0">{s.n}</div>
              <div><p className="font-medium mb-1">{s.t}</p><p className="text-sm text-gray-400">{s.d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-16 w-full">
        <h2 className="font-serif text-3xl font-medium text-center mb-8">Common questions</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-left hover:bg-gray-50 transition-colors">
                {f.q}
                <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === i && <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Apply form */}
      <section className="bg-white border-t border-gray-100 py-16" id="apply">
        <div className="max-w-lg mx-auto px-4">
          {submitted ? (
            <div className="text-center py-10">
              <p className="text-6xl mb-5">🎉</p>
              <h2 className="font-serif text-3xl font-medium text-brand-500 mb-3">Application received!</h2>
              <p className="text-gray-500 mb-6">Our team will review your application and be in touch within 2 business days.</p>
              <Link href="/" className="btn-primary">Back to homepage</Link>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-3xl font-medium mb-2 text-center">Apply to join</h2>
              <p className="text-center text-gray-400 text-sm mb-8">We will be in touch within 2 business days.</p>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="lbl">First name</label><input type="text" className="inp" placeholder="John" value={form.firstName} onChange={set('firstName')} required /></div>
                  <div><label className="lbl">Last name</label><input type="text" className="inp" placeholder="Smith" value={form.lastName} onChange={set('lastName')} required /></div>
                </div>
                <div><label className="lbl">Business name</label><input type="text" className="inp" placeholder="Smith's Home Services" value={form.business} onChange={set('business')} required /></div>
                <div><label className="lbl">Email</label><input type="email" className="inp" placeholder="john@example.co.nz" value={form.email} onChange={set('email')} required /></div>
                <div><label className="lbl">Phone</label><input type="tel" className="inp" placeholder="021 xxx xxxx" value={form.phone} onChange={set('phone')} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="lbl">Category</label>
                    <select className="inp" value={form.category} onChange={set('category')} required>
                      <option value="">Select...</option>
                      {['Home Cleaning', 'Gardening & Outdoors', 'Handyman & Maintenance', 'Fitness & Mobility', 'Personal Care', 'Transport & Errands'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">City</label>
                    <select className="inp" value={form.city} onChange={set('city')} required>
                      <option value="">Select...</option>
                      {['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="lbl">About your business</label><textarea className="inp resize-none h-24" placeholder="How long have you been operating? What makes your service special?" value={form.bio} onChange={set('bio')} /></div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="agree" checked={form.agreed} onChange={set('agreed')} className="mt-1 accent-brand-500" required />
                  <label htmlFor="agree" className="text-sm text-gray-500 cursor-pointer">I agree to the Independence NZ Provider Terms and consent to a background verification check.</label>
                </div>
                <button type="submit" disabled={loading || !form.agreed}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit application →'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
