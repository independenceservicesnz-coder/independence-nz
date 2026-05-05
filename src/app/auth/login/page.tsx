import { Suspense } from 'react'
import AuthForm from './AuthForm'

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center"><div className="text-sm text-gray-400">Loading...</div></div>}>
      <AuthForm />
    </Suspense>
  )
}
