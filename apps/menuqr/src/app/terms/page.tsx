import { Navbar, Footer } from '@traffic2u/ui';
import { QrCode } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<QrCode className="h-6 w-6 text-red-600" />} appName="MenuQR" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">1. Service</h2><p className="text-gray-700">MenuQR provides services as described. You own your data.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">2. Usage</h2><p className="text-gray-700">Use responsibly. Comply with applicable laws and third-party terms.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">3. Pricing</h2><p className="text-gray-700">Subscriptions auto-renew. 7-day money-back guarantee. Cancel anytime.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">4. Contact</h2><p className="text-gray-700">Questions? Email: legal@menuqr.com</p></section>
          </div>
        </div>
      </div>
      <Footer appName="MenuQR" />
    </div>
  );
}
