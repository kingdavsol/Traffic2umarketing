import { Navbar, Footer } from '@traffic2u/ui';
import { DollarSign } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<DollarSign className="h-6 w-6 text-green-600" />} appName="RevenueView" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">1. Data Collection</h2><p className="text-gray-700">We collect: account info, usage data, payment data (via Stripe).</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">2. Usage</h2><p className="text-gray-700">We use data to: provide service, improve features, process payments, provide support.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">3. Security</h2><p className="text-gray-700">Encryption, secure infrastructure, regular audits, access controls.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">4. Rights</h2><p className="text-gray-700">Access, export, delete your data anytime. Contact privacy@revenueview.com</p></section>
          </div>
        </div>
      </div>
      <Footer appName="RevenueView" />
    </div>
  );
}
