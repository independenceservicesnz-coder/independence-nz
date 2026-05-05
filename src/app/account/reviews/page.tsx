import Link from 'next/link'

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium">My Reviews</h1>
      <div className="card p-16 text-center">
        <p className="text-4xl mb-4">⭐</p>
        <p className="font-medium mb-2">No reviews yet</p>
        <p className="text-sm text-gray-400 mb-5">Reviews appear here after you rate a completed booking.</p>
        <Link href="/account/bookings" className="btn-primary">View bookings</Link>
      </div>
    </div>
  )
}
