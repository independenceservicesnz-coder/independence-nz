import Link from 'next/link'
export default function SavedPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium">Saved Providers</h1>
      <div className="card p-16 text-center">
        <p className="text-4xl mb-4">❤️</p>
        <p className="font-medium mb-2">No saved providers yet</p>
        <p className="text-sm text-gray-400 mb-5">Save your favourite providers for easy rebooking.</p>
        <Link href="/browse" className="btn-primary">Browse providers</Link>
      </div>
    </div>
  )
}
