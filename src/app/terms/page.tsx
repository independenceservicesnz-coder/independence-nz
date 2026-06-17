import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Independence NZ' }

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 w-full flex-1">
        <h1 className="font-serif text-4xl font-medium mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: June 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">1. About Independence NZ</h2>
            <p>Independence NZ operates an online marketplace connecting New Zealand customers with vetted local service providers. We facilitate bookings and secure payments but are not ourselves a service provider.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">2. Customer terms</h2>
            <p className="mb-3">By using Independence NZ as a customer you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate contact and address information when booking</li>
              <li>Be present or make access arrangements at the scheduled service time</li>
              <li>Treat providers with respect</li>
              <li>Only leave reviews for services you have genuinely received through the platform</li>
            </ul>
            <p className="mt-3">Your card is authorised at the time of booking but <strong>you are only charged once your service is complete</strong>. If a service cannot be completed, your authorisation is cancelled.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">3. Provider terms</h2>
            <p className="mb-3">Service providers listed on Independence NZ agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain valid business registration, insurance, and background check status</li>
              <li>Complete bookings at the agreed time and to a professional standard</li>
              <li>Notify customers promptly of any changes or delays</li>
              <li>Pay the monthly subscription fee of $99 NZD</li>
            </ul>
            <p className="mt-3">Providers keep 100% of service earnings. Independence NZ charges no commission on any booking.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">4. Payments</h2>
            <p>Payments are processed securely by Stripe. Customer card details are never stored on Independence NZ servers. Payment is held securely until the service is marked complete, then released to the provider within 2 business days.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">5. Cancellations</h2>
            <p>Cancellations made more than 24 hours before a scheduled service will result in the payment authorisation being released with no charge. For cancellations with less than 24 hours notice, please contact our team on <a href="tel:0273259707" className="text-brand-500 font-medium">027 325 9707</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">6. Liability</h2>
            <p>Independence NZ facilitates connections between customers and providers. We vet all providers but cannot guarantee the outcome of every service. Our liability is limited to the amount paid for the specific service in question. Nothing in these terms limits your rights under the Consumer Guarantees Act 1993 or the Fair Trading Act 1986.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-medium text-gray-900 mb-3">7. Contact</h2>
            <p>For any questions about these terms, please contact us:</p>
            <ul className="mt-2 space-y-1">
              <li>📞 <a href="tel:0273259707" className="text-brand-500">027 325 9707</a> — Mon–Fri 8am–6pm, Sat 9am–3pm</li>
              <li>✉️ <a href="mailto:independenceservicesnz@gmail.com" className="text-brand-500">independenceservicesnz@gmail.com</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 flex gap-6 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-brand-500">Privacy Policy →</Link>
          <Link href="/" className="hover:text-brand-500">Back to homepage</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
