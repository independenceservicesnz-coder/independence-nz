'use client'
import { Suspense, lazy } from 'react'

const BookPageContent = lazy(() => import('./BookPageContent'))

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    }>
      <BookPageContent />
    </Suspense>
  )
}
