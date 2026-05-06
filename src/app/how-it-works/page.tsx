import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="font-serif text-5xl font-medium mb-4">How Independence NZ works</h1>
          <p className="text-lg text-white/80">Simple, safe, and trusted — from browsing to booking to rating.</p>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 py-16 w-full">
        {[
          { n: '1', icon: '🔍', title: 'Browse services', body: 'Search by category or type what you need. Filter by location, rating, or price. Every provider on the platform has been vetted and verified.' },
          { n: '2', icon: '⭐', title: 'Compare providers', body: 'Read verified star ratings and reviews from real customers. Check pricing, availability, and provider profiles before making a decision.' },
          { n: '3', icon: '📅', title: 'Book a time', body: 'Choose a date and time that suits you. Select your specific service and add any notes for the provider.' },
          { n: '4', icon: '💳', title: 'Book & pay — no extra fees', body: 'You only pay for the service itself. Independence NZ charges customers no platform fees, no membership fees, and no hidden costs. Ever.' },
          { n: '5', icon: '🏠', title: 'Receive your service', body: 'Your verified provider arrives at the scheduled time. If anything is ever wrong, our NZ-based support team is here to help.' },
          { n: '6', icon: '★', title: 'Rate your experience', body: 'After every completed booking, leave a star rating and written review. Your feedback helps others choose the best providers.' },
        ].map(s => (
          <div key={s.n} className="flex gap-6 mb-12 last:mb-0">
            <div className="shrink-0">
              <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-500 font-serif text-2xl font-semibold flex items-center justify-center">{s.n}</div>
            </div>
            <div className="pt-2">
              <div className="text-3xl mb-2">{s.icon}</div>
              <h2 className="font-serif text-xl font-medium mb-2">{s.title}</h2>
              <p className="text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
        <div className="bg-brand-500 rounded-2xl p-8 text-white text-center mt-12">
          <h2 className="font-serif text-2xl font-medium mb-3">Ready to get started?</h2>
          <p className="text-white/75 mb-6">Browse trusted local providers and make your first booking today.</p>
          <Link href="/browse" className="btn-white">Browse Services →</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
