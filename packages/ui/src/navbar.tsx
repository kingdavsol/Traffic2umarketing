import * as React from 'react';
import { Button } from './button';
import { cn } from './utils';

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo: React.ReactNode;
  appName: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ logo, appName, ctaText = 'Get Started', onCtaClick, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              {logo}
              <span className="text-xl font-bold text-gray-900">{appName}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                Features
              </Button>
              <Button variant="ghost" size="sm">
                Pricing
              </Button>
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm" onClick={onCtaClick}>
                {ctaText}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }
);
Navbar.displayName = 'Navbar';

export { Navbar };
