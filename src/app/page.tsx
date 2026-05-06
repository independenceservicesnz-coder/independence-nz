import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSearch from '@/components/marketplace/HeroSearch'
import BookingModal from '@/components/booking/BookingModal'

const categories = [
  { name: 'Home Cleaning', slug: 'cleaning', icon: '🧹', count: 42, featured: true },
  { name: 'Gardening', slug: 'gardening', icon: '🌿', count: 28 },
  { name: 'Handyman', slug: 'handyman', icon: '🔧', count: 31 },
  { name: 'Fitness & Mobility', slug: 'fitness', icon: '🏃', count: 19 },
  { name: 'Personal Care', slug: 'care', icon: '🤝', count: 14 },
  { name: 'Transport', slug: 'transport', icon: '🚗', count: 11 },
]

const providers = [
  { id: '1', name: 'Pristine Home Services', cat: 'Home Cleaning', location: 'Auckland Central', rating: 4.9, reviews: 128, price: 85, priceLabel: '$85 / visit', avail: 'Available tomorrow', emoji: '🧹', bg: 'from-emerald-50 to-emerald-100', topRated: true, desc: 'Professional home cleaning service' },
  { id: '2', name: 'Green Thumb Gardens', cat: 'Gardening', location: 'North Shore', rating: 4.8, reviews: 94, price: 65, priceLabel: '$65 / hour', avail: 'Available Friday', emoji: '🌿', bg: 'from-emerald-50 to-amber-50', topRated: false, desc: 'Garden maintenance and care' },
  { id: '3', name: 'Reliable Handyman Co.', cat: 'Handyman', location: 'Manukau', rating: 4.7, reviews: 61, price: 75, priceLabel: '$75 / hour', avail: 'Available Monday', emoji: '🔧', bg: 'from-violet-50 to-purple-100', topRated: false, desc: 'Home repairs and maintenance' },
  { id: '4', name: 'MoveBetter Health', cat: 'Fitness & Mobility', location: 'Remuera', rating: 5.0, reviews: 47, price: 90, priceLabel: '$90 / session', avail: 'Available today', emoji: '🏃', bg: 'from-rose-50 to-pink-100', topRated: true, desc: 'Mobility and fitness sessions' },
]

const reviews = [
  { initials: 'MK', name: 'Margaret K.', date: '3 days ago', location: 'Auckland', text: 'Absolutely wonderful service. Our home has not been this clean in years. Booking through Independence NZ was so easy and everything went perfectly.', service: 'Home Cleaning', color: 'bg-emerald-100 text-emerald-700' },
  { initials: 'RJ', name: 'Robert J.', date: '1 week ago', location: 'North Shore', text: 'My mum lives alone and we needed someone trustworthy for her garden. Green Thumb Gardens were perfect — reliable, kind, and did great work every visit.', service: 'Gardening', color: 'bg-amber-100 text-amber-700' },
  { initials: 'SL', name: 'Susan L.', date: '2 weeks ago', location: 'Remuera', text: 'Being able to compare providers, read real reviews, and book all in one place is exactly what I needed. We have already rebooked twice. Highly recommend.', service: 'Home Cleaning', color: 'bg-violet-100 text-violet-700' },
]

const howItWorks = [
  { n: '1', title: 'Choose a service', desc: 'Browse by category or search for exactly what you need' },
  { n: '2', title: 'Pick a provider', desc: 'Compare star ratings, read verified reviews, check availability' },
  { n: '3', title: 'Book & pay — no extra fees', desc: 'You only pay for the service itself. No platform fees, no membership fees, no hidden costs. Ever.' },
  { n: '4', title: 'Rate your service', desc: 'Leave a star rating after your service to help others choose' },
]

const trust = [
  { icon: '💚', label: 'No extra fees ever', sub: 'You only pay for the service you book — nothing more' },
  { icon: '🔒', label: 'Payment protected', sub: 'Payment held safely until your service is complete' },
  { icon: '✅', label: 'Vetted providers', sub: 'Every provider is background checked and verified' },
  { icon: '⭐', label: 'Verified reviews', sub: 'Reviews only from customers with real bookings' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
            ✦ New Zealand&apos;s trusted home services marketplace
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-medium leading-tight mb-5 tracking-tight">
            Book trusted services.<br />
            <em className="text-emerald-200 not-italic">Stay independent</em> for longer.
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
            Browse vetted local providers, book in minutes, pay securely — and only pay for the service you receive.
          </p>
          <HeroSearch />
          <div className="flex flex-wrap justify-center gap-6 mt-10 pt-10 border-t border-white/15 text-sm text-white/70">
            {[['2,400+', 'Happy customers'], ['200+', 'Vetted providers'], ['4.9★', 'Average rating'], ['$0', 'Platform fees']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-serif text-2xl font-medium text-white">{v}</div>
                <div>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NO EXTRA FEES BANNER */}
      <div className="bg-brand-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 text-center">
          <p className="font-serif text-xl font-medium mb-1">
            You only ever pay for the service you book. Nothing more.
          </p>
          <p className="text-white/75 text-sm">
            No membership fees · No platform fees · No hidden charges · Just the cost of your service
          </p>
        </div>
      </div>

      {/* HELPLINE BANNER */}
      <div className="bg-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-medium text-sm">Prefer to book by phone? Call our NZ helpline</p>
              <p className="text-white/70 text-xs">Our friendly team will find the right provider and book for you</p>
            </div>
          </div>
          <a href="tel:0273259707"
            className="shrink-0 bg-white text-brand-500 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            📞 027 325 9707
          </a>
          <p className="text-white/60 text-xs shrink-0">Mon–Fri 8am–6pm · Sat 9am–3pm</p>
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-3xl font-medium">Browse by service</h2>
          <Link href="/browse" className="text-sm text-brand-500 font-medium hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(c => (
            <Link
              key={c.slug}
              href={`/browse?cat=${c.slug}`}
              className={`bg-white rounded-xl border-2 p-5 text-center hover:shadow-md transition-all group ${
                c.featured ? 'border-brand-400' : 'border-gray-100 hover:border-brand-200'
              }`}
            >
              {c.featured && (
                <div className="text-xs font-medium text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full inline-block mb-2">Popular</div>
              )}
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-sm font-medium text-gray-800 group-hover:text-brand-500 transition-colors">{c.name}</div>
              <div className="text-xs text-gray-400 mt-1">{c.count} providers</div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP PROVIDERS */}
      <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-3xl font-medium">Top-rated providers near you</h2>
          <Link href="/browse" className="text-sm text-brand-500 font-medium hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {providers.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
              <div className={`h-32 bg-gradient-to-br ${p.bg} flex items-center justify-center text-5xl relative`}>
                {p.emoji}
                <span className="absolute top-3 left-3 verified">✓ Verified</span>
                {p.topRated && <span className="absolute top-3 right-3 badge-amber">⭐ Top Rated</span>}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="font-medium text-gray-900 text-sm mb-0.5 group-hover:text-brand-500 transition-colors">{p.name}</p>
                <p className="text-xs text-gray-400 mb-2">{p.cat} · {p.location}</p>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-amber-400">{'★'.repeat(Math.round(p.rating))}</span>
                  <span className="text-xs font-medium text-gray-700">{p.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({p.reviews})</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">From <strong className="text-gray-700">{p.priceLabel}</strong></p>
                <div className="mt-auto pt-3 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-brand-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block"></span>
                      {p.avail}
                    </span>
                  </div>
                  <BookingModal
                    providerName={p.name}
                    providerId={p.id}
                    serviceName={p.cat}
                    serviceDescription={p.desc}
                    price={p.price}
                    buttonLabel="Book now →"
                    buttonClass="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-serif text-3xl font-medium text-center mb-12">How Independence NZ works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map(({ n, title, desc }) => (
              <div key={n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 font-serif text-xl font-semibold flex items-center justify-center mx-auto mb-4">{n}</div>
                <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {trust.map(t => (
              <div key={t.label} className="py-8 px-6 text-center">
                <div className="text-3xl mb-3">{t.icon}</div>
                <div className="text-sm font-medium mb-1">{t.label}</div>
                <div className="text-xs text-gray-400">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PHOTO SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="rounded-2xl overflow-hidden h-72 md:h-96 relative">
          <img
src="https://images.unsplash.com/photo-1616286608358-0e1b143f7d2f?w=1200&q=80"
alt="Happy elderly person smiling at home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-700/70 to-transparent flex items-center">
            <div className="px-10 text-white max-w-md">
              <h2 className="font-serif text-3xl font-medium mb-3">Still dancing.<br />Still independent.</h2>
              <p className="text-white/80 text-sm leading-relaxed mb-5">Trusted by over 2,400 New Zealand families to find reliable home services.</p>
              <Link href="/browse" className="bg-white text-brand-500 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm inline-block">
                Browse services →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
        <h2 className="font-serif text-3xl font-medium text-center mb-10">What customers are saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map(r => (
            <div key={r.name} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${r.color}`}>{r.initials}</div>
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.date} · {r.location}</div>
                </div>
              </div>
              <div className="text-amber-400 text-lg mb-3">★★★★★</div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">&ldquo;{r.text}&rdquo;</p>
              <div className="text-xs text-brand-500 font-medium">✓ {r.service} · Verified booking</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16 w-full">
        <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="font-serif text-3xl font-medium mb-2">Grow your business with Independence NZ</h2>
            <p className="text-white/75 max-w-md">Join 200+ vetted local providers. One flat monthly fee — no commission on any booking, ever.</p>
          </div>
          <div className="shrink-0 text-center">
            <Link href="/providers" className="btn-white">Become a Provider</Link>
            <p className="text-xs text-white/60 mt-2">$99/month · No commission · Cancel anytime</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
