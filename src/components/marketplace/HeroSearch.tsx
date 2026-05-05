'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSearch() {
  const [q, setQ] = useState('')
  const router = useRouter()

  const search = () => {
    router.push('/browse' + (q ? `?q=${encodeURIComponent(q)}` : ''))
  }

  return (
    <div className="flex max-w-lg mx-auto bg-white rounded-xl shadow-2xl shadow-black/20 p-1.5 mb-6">
      <input
        type="text"
        placeholder="What service do you need?"
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && search()}
        className="flex-1 px-4 py-2.5 text-gray-800 text-sm outline-none bg-transparent placeholder-gray-400"
      />
      <button onClick={search}
        className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">
        Find Services →
      </button>
    </div>
  )
}
