import { Navbar, Footer } from '@traffic2u/ui';
import { Linkedin } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logo={<Linkedin className="h-6 w-6 text-blue-600" />} appName="LinkedBoost" />
      <div className="flex-1 bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">1. Service</h2><p className="text-gray-700">LinkedBoost provides LinkedIn scheduling and optimization tools. You own your content.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">2. LinkedIn Terms</h2><p className="text-gray-700">You must comply with LinkedIn's terms of service and policies when using our service.</p></section>
            <section className="mb-8"><h2 className="text-2xl font-semibold mb-4">3. Contact</h2><p className="text-gray-700">Questions? Email: legal@linkedboost.com</p></section>
          </div>
        </div>
      </div>
      <Footer appName="LinkedBoost" />
    </div>
  );
}
