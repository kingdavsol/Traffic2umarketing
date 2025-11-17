import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Check } from 'lucide-react';
import { cn } from './utils';

export interface PricingTier {
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  cta: string;
  popular?: boolean;
  disabled?: boolean;
}

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tier: PricingTier;
  onSelect?: () => void;
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  ({ tier, onSelect, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'relative flex flex-col',
          tier.popular && 'border-blue-600 border-2 shadow-lg',
          className
        )}
        {...props}
      >
        {tier.popular && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
            Most Popular
          </Badge>
        )}
        <CardHeader>
          <CardTitle>{tier.name}</CardTitle>
          <CardDescription>{tier.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="mb-6">
            <span className="text-4xl font-bold">${tier.price}</span>
            <span className="text-gray-600">/{tier.interval}</span>
          </div>
          <ul className="space-y-3">
            {tier.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="mr-2 h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            variant={tier.popular ? 'default' : 'outline'}
            size="lg"
            onClick={onSelect}
            disabled={tier.disabled}
          >
            {tier.cta}
          </Button>
        </CardFooter>
      </Card>
    );
  }
);
PricingCard.displayName = 'PricingCard';

export { PricingCard };
