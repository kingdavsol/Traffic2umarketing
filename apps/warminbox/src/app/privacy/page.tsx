import { Navbar, Footer } from '@traffic2u/ui';
import { Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Mail className="h-6 w-6 text-green-600" />} appName="WarmInbox" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <div className="prose prose-green max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Name, email address, and payment information</li>
                <li>Email account credentials (encrypted)</li>
                <li>IP address and device information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Email Data</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Warm-up emails sent and received</li>
                <li>Deliverability metrics and statistics</li>
                <li>Domain and DNS configuration data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Data</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Providing email warm-up services</li>
                <li>Monitoring deliverability and sender reputation</li>
                <li>Processing payments via Stripe</li>
                <li>Sending service updates and support</li>
                <li>Improving our service and algorithms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Email Privacy</h2>
              <p className="text-gray-700 mb-4">
                <strong>We respect your email privacy:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>We only access emails necessary for warm-up operations</li>
                <li>Personal emails in your inbox are never read or analyzed</li>
                <li>Warm-up emails are automatically generated, not from your content</li>
                <li>Email credentials are encrypted using industry-standard methods</li>
                <li>We never sell or share your email data with third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement robust security measures:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>AES-256 encryption for stored credentials</li>
                <li>TLS/SSL for data transmission</li>
                <li>Regular security audits and penetration testing</li>
                <li>SOC 2 compliant infrastructure</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                We share limited data with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>AWS/GCP:</strong> Infrastructure hosting</li>
                <li><strong>Email Providers:</strong> SMTP connections for warm-up</li>
                <li><strong>Analytics:</strong> Anonymized usage data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Access your personal data</li>
                <li>Request data deletion</li>
                <li>Disconnect email accounts at any time</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain data for as long as your account is active. Upon deletion:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Email credentials are immediately deleted</li>
                <li>Warm-up emails are purged within 30 days</li>
                <li>Analytics data may be retained anonymously</li>
                <li>Billing records kept per legal requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact</h2>
              <p className="text-gray-700">
                Privacy concerns? Contact: privacy@warminbox.io<br />
                Data Protection Officer: dpo@warminbox.io
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer appName="WarmInbox" />
    </div>
  );
}
