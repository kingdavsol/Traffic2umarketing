import { Navbar, Footer } from '@traffic2u/ui';
import { Linkedin } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Linkedin className="h-6 w-6 text-blue-600" />} appName="LinkedBoost" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">1. Data</h2><p className="text-gray-700">We collect: account info, LinkedIn connection, post content, analytics.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">2. LinkedIn Access</h2><p className="text-gray-700">We only post on your behalf when you schedule. We don't read messages or connections.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">3. Security</h2><p className="text-gray-700">OAuth tokens encrypted. Regular security audits.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">4. Contact</h2><p className="text-gray-700">Privacy concerns? privacy@linkedboost.com</p></section>
          </div>
        </div>
      </div>
      <Footer appName="LinkedBoost" />
    </div>
  );
}
