import * as React from 'react';
import { cn } from './utils';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  appName: string;
  year?: number;
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ appName, year = new Date().getFullYear(), className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn('border-t border-gray-200 bg-gray-50', className)}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{appName}</h3>
              <p className="text-sm text-gray-600">
                Building the future of SaaS, one tool at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#roadmap" className="text-sm text-gray-600 hover:text-gray-900">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="text-sm text-gray-600 hover:text-gray-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#blog" className="text-sm text-gray-600 hover:text-gray-900">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-sm text-gray-600 hover:text-gray-900">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © {year} {appName}. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }
);
Footer.displayName = 'Footer';

export { Footer };
