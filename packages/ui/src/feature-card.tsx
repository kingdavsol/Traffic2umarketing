import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { cn } from './utils';

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('hover:shadow-md transition-shadow', className)} {...props}>
        <CardHeader>
          <div className="mb-4 text-blue-600">{icon}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
);
FeatureCard.displayName = 'FeatureCard';

export { FeatureCard };
