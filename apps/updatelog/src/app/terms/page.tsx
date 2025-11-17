import { Navbar, Footer } from '@traffic2u/ui';
import { Bell } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Bell className="h-6 w-6 text-purple-600" />} appName="UpdateLog" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">1. Acceptance</h2><p className="text-gray-700">By using UpdateLog, you accept these terms. UpdateLog provides changelog and product update publishing services.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">2. Service</h2><p className="text-gray-700">We provide tools to publish, manage, and distribute product updates to your users through widgets, emails, and integrations.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">3. Content</h2><p className="text-gray-700">You retain ownership of content published. We may display your content as part of the service. You're responsible for content accuracy and compliance.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">4. Pricing</h2><p className="text-gray-700">Subscription fees are charged monthly. You can cancel anytime. 7-day money-back guarantee available.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">5. Contact</h2><p className="text-gray-700">Questions? Email: legal@updatelog.com</p></section>
          </div>
        </div>
      </div>
      <Footer appName="UpdateLog" />
    </div>
  );
}
