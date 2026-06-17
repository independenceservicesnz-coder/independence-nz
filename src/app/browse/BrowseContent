'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const ALL_PROVIDERS = [
  { id: '1', name: 'Pristine Home Services', cat: 'cleaning', catLabel: 'Home Cleaning', location: 'Auckland Central', rating: 4.9, reviews: 128, price: 85, priceLabel: '$85 / visit', avail: 'Available tomorrow', emoji: '🧹', bg: 'from-emerald-50 to-emerald-100', topRated: true, desc: 'Professional home cleaning service' },
  { id: '2', name: 'Sparkle Clean NZ', cat: 'cleaning', catLabel: 'Home Cleaning', location: 'Ponsonby', rating: 4.7, reviews: 83, price: 75, priceLabel: '$75 / visit', avail: 'Available Friday', emoji: '🧹', bg: 'from-emerald-50 to-teal-50', topRated: false, desc: 'Thorough residential cleaning' },
  { id: '3', name: 'Green Thumb Gardens', cat: 'gardening', catLabel: 'Gardening & Outdoors', location: 'North Shore', rating: 4.8, reviews: 94, price: 65, priceLabel: '$65 / hour', avail: 'Available Friday', emoji: '🌿', bg: 'from-emerald-50 to-amber-50', topRated: false, desc: 'Garden maintenance and care' },
  { id: '4', name: 'Kiwi Garden Care', cat: 'gardening', catLabel: 'Gardening & Outdoors', location: 'West Auckland', rating: 4.6, reviews: 51, price: 60, priceLabel: '$60 / hour', avail: 'Available Monday', emoji: '🌿', bg: 'from-green-50 to-yellow-50', topRated: false, desc: 'Lawn and garden maintenance' },
  { id: '5', name: 'Reliable Handyman Co.', cat: 'handyman', catLabel: 'Handyman & Maintenance', location: 'Manukau', rating: 4.7, reviews: 61, price: 75, priceLabel: '$75 / hour', avail: 'Available Monday', emoji: '🔧', bg: 'from-violet-50 to-purple-100', topRated: false, desc: 'Home repairs and maintenance' },
  { id: '6', name: 'MoveBetter Health', cat: 'fitness', catLabel: 'Fitness & Mobility', location: 'Remuera', rating: 5.0, reviews: 47, price: 90, priceLabel: '$90 / session', avail: 'Available today', emoji: '🏃', bg: 'from-rose-50 to-pink-100', topRated: true, desc: 'Mobility and fitness sessions' },
  { id: '7', name: 'Care Connect NZ', cat: 'care', catLabel: 'Personal Care', location: 'Takapuna', rating: 4.9, reviews: 38, price: 55, priceLabel: '$55 / hour', avail: 'Available tomorrow', emoji: '🤝', bg: 'from-pink-50 to-rose-50', topRated: false, desc: 'Personal support and companionship' },
  { id: '8', name: 'Easy Rides NZ', cat: 'transport', catLabel: 'Transport & Errands', location: 'CBD', rating: 4.8, reviews: 29, price: 45, priceLabel: '$45 / trip', avail: 'Available today', emoji: '🚗', bg: 'from-blue-50 to-indigo-50', topRated: false, desc: 'Transport and errand assistance' },
]

const CATS = [
  { id: 'all', label: 'All services' },
  { id: 'cleaning', label: '🧹 Cleaning' },
  { id: 'gardening', label: '🌿 Gardening' },
  { id: 'handyman', label: '🔧 Handyman' },
  { id: 'fitness', label: '🏃 Fitness' },
  { id: 'care', label: '🤝 Personal Care' },
  { id: 'transport', label: '🚗 Transport' },
]

export default function BrowseContent() {
  const searchParams = useSearchParams()
  const [cat, setCat] = useState(searchParams.get('cat') || 'all')
  const [sort, setSort] = useState('rating')
  const [q, setQ] = useState(searchParams.get('q') || '')

  const filtered = useMemo(() => {
    let list = ALL_PROVIDERS.filter(p => cat === 'all' || p.cat === cat)
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.location.toLowerCase().includes(q.toLowerCase()) ||
        p.catLabel.toLowerCase().includes(q.toLowerCase())
      )
    }
    const sorts: Record<string, (a: any, b: any) => number> = {
      rating: (a, b) => b.rating - a.rating,
      reviews: (a, b) => b.reviews - a.reviews,
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
    }
    return [...list].sort(sorts[sort] || sorts.rating)
  }, [cat, sort, q])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 focus-within:border-brand-400 transition-colors">
              <span className="text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search services or providers..."
                value={q}
                onChange={e => setQ(e.target.value)}
                className="flex-1 py-2.5 text-sm bg-transparent outline-none"
              />
              {q && (
                <button onClick={() => setQ('')} className="text-gray-300 hover:text-gray-500 text-lg leading-none">×</button>
              )}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none cursor-pointer text-gray-600"
            >
              <option value="rating">Top rated</option>
              <option value="reviews">Most reviewed</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATS.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  cat === c.id
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl shrink-0">💚</span>
          <div>
            <p className="text-sm font-medium text-brand-700">No platform fees — ever</p>
            <p className="text-xs text-brand-500">
              You only pay for the service you book. Independence NZ charges customers nothing extra.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          <strong className="text-gray-900">{filtered.length}</strong> provider{filtered.length !== 1 ? 's' : ''} in Auckland
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-medium text-gray-700 mb-2">No providers found</p>
            <p className="text-sm text-gray-400 mb-5">Try a different search or category</p>
            <button
              onClick={() => { setQ(''); setCat('all') }}
              className="btn-primary"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                <div
                  className={`h-36 bg-gradient-to-br ${p.bg} flex items-center justify-center text-5xl relative`}
                >
                  {p.emoji}
                  <span className="absolute top-3 left-3 verified">✓ Verified</span>
                  {p.topRated && (
                    <span className="absolute top-3 right-3 badge-amber">⭐ Top Rated</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="font-medium text-gray-900 text-sm mb-0.5 group-hover:text-brand-500 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">{p.catLabel} · {p.location}</p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-amber-400 text-sm">
                      {'★'.repeat(Math.round(p.rating))}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{p.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({p.reviews} reviews)</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    From <strong className="text-gray-700">{p.priceLabel}</strong>
                  </p>
                  <div className="mt-auto pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-brand-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block"></span>
                        {p.avail}
                      </span>
                    </div>
                    <Link
                      href={`/book?provider=${encodeURIComponent(p.name)}&service=${encodeURIComponent(p.catLabel)}&price=${p.price}&providerId=${p.id}`}
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors text-center block"
                    >
                      Book now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-lg font-serif font-medium mb-1">Prefer to book by phone?</p>
          <p className="text-sm text-gray-400 mb-4">
            Our friendly NZ-based team can find the right provider and book for you.
          </p>
          <a href="tel:0273259707" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            📞 Call 027 325 9707
          </a>
          <p className="text-xs text-gray-400 mt-3">Mon–Fri 8am–6pm · Sat 9am–3pm</p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
