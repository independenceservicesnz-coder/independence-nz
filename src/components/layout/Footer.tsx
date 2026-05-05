import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="font-serif text-xl font-semibold text-brand-500">
          Independence<span className="text-blue-500">NZ</span>
        </Link>
        <div className="flex gap-6 flex-wrap justify-center">
          <Link href="/browse" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">Browse Services</Link>
          <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">How it works</Link>
          <Link href="/providers" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">For Providers</Link>
          <Link href="/terms" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">Terms</Link>
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">Privacy</Link>
        </div>
        <p className="text-sm text-gray-400">© 2025 Independence NZ</p>
      </div>
    </footer>
  )
}
