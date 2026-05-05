export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-medium">Security</h1>
      <div className="card p-6 space-y-4">
        <h2 className="font-medium text-sm">Password</h2>
        <p className="text-sm text-gray-400">To change your password, sign out and use the &quot;Forgot password&quot; option on the sign in page.</p>
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-600">
          🔒 Your account is secured with Supabase Auth. All sessions are encrypted.
        </div>
      </div>
    </div>
  )
}
