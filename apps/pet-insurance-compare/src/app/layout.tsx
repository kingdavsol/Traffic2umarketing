import type { Metadata } from "next";
import { SITES } from "@traffic2u/config";
import "./globals.css";

const site = SITES.pet;

export const metadata: Metadata = {
  title: `${site.displayName} - Compare Pet Insurance Quotes`,
  description: site.description,
  keywords: ["pet insurance", "compare quotes", "pet coverage", "pet health insurance"],
  openGraph: {
    title: `${site.displayName} - Compare Pet Insurance Quotes`,
    description: site.description,
    url: `https://${site.domain}`,
    siteName: site.displayName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.displayName} - Compare Pet Insurance Quotes`,
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex flex-col">
          {/* Navigation */}
          <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold" style={{ color: site.primaryColor }}>
                    {site.displayName}
                  </h1>
                </div>
                <div className="flex gap-4">
                  <a href="/" className="text-gray-700 hover:text-gray-900">
                    Home
                  </a>
                  <a href="/guides" className="text-gray-700 hover:text-gray-900">
                    Guides
                  </a>
                  <a href="/reviews" className="text-gray-700 hover:text-gray-900">
                    Reviews
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="text-white font-bold mb-4">{site.displayName}</h3>
                  <p className="text-sm">{site.description}</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="/guides" className="hover:text-white">
                        Insurance Guides
                      </a>
                    </li>
                    <li>
                      <a href="/faq" className="hover:text-white">
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a href="/contact" className="hover:text-white">
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Resources</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="/blog" className="hover:text-white">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="/compare" className="hover:text-white">
                        Compare
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="/privacy" className="hover:text-white">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="/terms" className="hover:text-white">
                        Terms
                      </a>
                    </li>
                    <li>
                      <a href="/disclosure" className="hover:text-white">
                        Affiliate Disclosure
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-8 text-sm">
                <p>
                  © 2025 {site.displayName}. All rights reserved. | We are a
                  participant in the Amazon Services LLC Associates Program and other
                  affiliate advertising programs.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
