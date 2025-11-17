import { Navbar, Footer } from '@traffic2u/ui';
import { Bell } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Bell className="h-6 w-6 text-purple-600" />} appName="UpdateLog" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">1. Data Collection</h2><p className="text-gray-700">We collect: account information, published updates, usage analytics, payment data (via Stripe).</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">2. Data Usage</h2><p className="text-gray-700">We use data to: provide the service, improve features, process payments, send notifications, provide support.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">3. Data Security</h2><p className="text-gray-700">We use encryption, secure infrastructure (AWS/GCP), regular security audits, and access controls to protect your data.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2><p className="text-gray-700">You can access, export, or delete your data anytime. Contact privacy@updatelog.io for requests.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">5. Cookies</h2><p className="text-gray-700">We use cookies for authentication, preferences, and analytics. You can control cookies via browser settings.</p></section>
          </div>
        </div>
      </div>
      <Footer appName="UpdateLog" />
    </div>
  );
}
