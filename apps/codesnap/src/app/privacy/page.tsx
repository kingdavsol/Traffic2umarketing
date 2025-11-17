import { Navbar, Footer } from '@traffic2u/ui';
import { Sparkles } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        logo={<Sparkles className="h-6 w-6 text-blue-600" />}
        appName="CodeSnap"
      />

      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                CodeSnap ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Name and email address (for account creation)</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Profile information you choose to provide</li>
                <li>Communications with our support team</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Usage Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain information about your use of the Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Screenshots you upload (temporarily, for processing)</li>
                <li>Generated code and conversion history</li>
                <li>Usage statistics and feature interactions</li>
                <li>Device information, IP address, and browser type</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the collected information for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Providing and improving the Service</li>
                <li>Processing your transactions and managing subscriptions</li>
                <li>Sending administrative information and updates</li>
                <li>Responding to your requests and customer support</li>
                <li>Analyzing usage patterns to enhance user experience</li>
                <li>Training and improving our AI models</li>
                <li>Detecting and preventing fraud or abuse</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure cloud infrastructure (AWS/GCP)</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information</li>
                <li>Screenshots are processed and deleted within 24 hours</li>
                <li>Generated code is stored securely in your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> Stripe (payments), AWS/GCP (hosting), Resend (emails)</li>
                <li><strong>AI Providers:</strong> OpenAI (for image analysis and code generation)</li>
                <li><strong>Analytics:</strong> Aggregated, anonymized usage data for service improvement</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at privacy@codesnap.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Authentication and security</li>
                <li>Preferences and settings</li>
                <li>Analytics and performance monitoring</li>
                <li>Advertising and marketing (with your consent)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your account is active</li>
                <li>Necessary to provide the Service</li>
                <li>Required by law or legitimate business purposes</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Screenshots are automatically deleted within 24 hours. Account data is deleted within 30 days
                of account closure, except where required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children. If you believe we have collected information from a child,
                please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own.
                We ensure appropriate safeguards are in place to protect your data in accordance with this
                Privacy Policy and applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes via
                email or through the Service. Your continued use after changes constitutes acceptance of the
                updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <p className="text-gray-700">
                Email: privacy@codesnap.com<br />
                Address: [Your Business Address]<br />
                Data Protection Officer: dpo@codesnap.com
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer appName="CodeSnap" />
    </div>
  );
}
