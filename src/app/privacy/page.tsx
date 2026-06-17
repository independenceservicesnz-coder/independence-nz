import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Independence NZ' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 w-full flex-1">
        <h1 className="font-serif text-4xl font-medium mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">1. What we collect</h2>
            <p className="mb-3">When you use Independence NZ we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information</strong> — your name, email address, and phone number when you register</li>
              <li><strong>Booking information</strong> — service address, scheduled dates, and any notes you provide</li>
              <li><strong>Payment information</strong> — processed by Stripe; we never store your card details</li>
              <li><strong>Usage data</strong> — pages visited and actions taken, used to improve the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">2. How we use your information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and manage your bookings</li>
              <li>To contact you about your bookings and account</li>
              <li>To send service notifications and reminders</li>
              <li>To improve the Independence NZ platform</li>
              <li>To comply with our legal obligations</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">3. Information sharing</h2>
            <p className="mb-3">We share necessary booking details (name, address, scheduled time) with the service provider assigned to your booking. We use the following trusted third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase</strong> — secure database and authentication (hosted in Australia)</li>
              <li><strong>Stripe</strong> — payment processing (PCI-DSS compliant)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">4. Data security</h2>
            <p>Your data is stored securely with encryption in transit and at rest. Authentication is handled by Supabase Auth. We follow industry best practices to protect your personal information.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">5. Your rights</h2>
            <p className="mb-3">Under the New Zealand Privacy Act 2020 you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:independenceservicesnz@gmail.com" className="text-brand-500">independenceservicesnz@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">6. Cookies</h2>
            <p>We use essential cookies only — required for authentication and session management. We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">7. Contact</h2>
            <p>Privacy questions or requests:</p>
            <ul className="mt-2 space-y-1">
              <li>📞 <a href="tel:0273259707" className="text-brand-500">027 325 9707</a> — Mon–Fri 8am–6pm, Sat 9am–3pm</li>
              <li>✉️ <a href="mailto:independenceservicesnz@gmail.com" className="text-brand-500">independenceservicesnz@gmail.com</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex gap-6 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-brand-500">Terms of Service →</Link>
          <Link href="/" className="hover:text-brand-500">Back to homepage</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
