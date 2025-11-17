import { Navbar, Footer } from '@traffic2u/ui';
import { FlaskConical } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<FlaskConical className="h-6 w-6 text-orange-600" />} appName="TestLift" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">1. Service</h2><p className="text-gray-700">TestLift provides A/B testing tools for websites. You retain ownership of your tests and data.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">2. Usage</h2><p className="text-gray-700">Use the service responsibly. Don't test malicious content or violate user privacy laws.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">3. Pricing</h2><p className="text-gray-700">Subscriptions renew automatically. 7-day money-back guarantee. Cancel anytime.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">4. Contact</h2><p className="text-gray-700">Questions? Email: legal@testlift.com</p></section>
          </div>
        </div>
      </div>
      <Footer appName="TestLift" />
    </div>
  );
}
