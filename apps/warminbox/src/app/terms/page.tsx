import { Navbar, Footer } from '@traffic2u/ui';
import { Mail } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Mail className="h-6 w-6 text-green-600" />} appName="WarmInbox" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <div className="prose prose-green max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By using WarmInbox, you accept these Terms of Service. WarmInbox provides email warm-up services
                to improve deliverability and sender reputation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                WarmInbox automates email warm-up by gradually sending emails to build domain reputation.
                Our service integrates with your email accounts via SMTP or OAuth to manage warm-up campaigns.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Use the service for legitimate business email purposes</li>
                <li>Comply with CAN-SPAM, GDPR, and applicable email regulations</li>
                <li>Not send spam, phishing, or malicious content</li>
                <li>Respect recipient privacy and unsubscribe requests</li>
                <li>Maintain accurate account information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Email Account Access</h2>
              <p className="text-gray-700 mb-4">
                By connecting your email accounts, you grant WarmInbox permission to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Send emails on your behalf for warm-up purposes</li>
                <li>Access inbox to manage replies and interactions</li>
                <li>Monitor deliverability metrics</li>
                <li>Store credentials securely (encrypted)</li>
              </ul>
              <p className="text-gray-700">
                We never read, share, or use your personal emails beyond warm-up operations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription & Billing</h2>
              <p className="text-gray-700 mb-4">
                Subscription fees are based on the number of email accounts and usage limits.
                Billing is handled securely through Stripe. Subscriptions auto-renew unless canceled.
                7-day money-back guarantee for new subscribers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Deliverability Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                While WarmInbox improves email deliverability, we cannot guarantee 100% inbox placement.
                Deliverability depends on many factors including content quality, recipient engagement,
                and email provider policies beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                WarmInbox is not liable for account suspensions, blacklisting, or deliverability issues
                resulting from user content or practices. Users are responsible for compliance with
                email laws and provider policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact</h2>
              <p className="text-gray-700">
                Questions? Contact us at legal@warminbox.io
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer appName="WarmInbox" />
    </div>
  );
}
