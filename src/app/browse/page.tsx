import { Suspense } from 'react'
import BrowseContent from './BrowseContent'

export const metadata = { title: 'Browse Services — Independence NZ' }

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  )
}
