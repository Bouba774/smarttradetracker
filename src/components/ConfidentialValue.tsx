import React from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { cn } from '@/lib/utils';

interface ConfidentialValueProps {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

export const ConfidentialValue: React.FC<ConfidentialValueProps> = ({
  children,
  className,
  as: Component = 'span',
}) => {
  const { settings } = useSecurity();

  if (settings.confidentialMode) {
    return (
      <Component
        className={cn(
          "select-none",
          "blur-sm hover:blur-none transition-all duration-300",
          className
        )}
        title="Click and hold to reveal"
      >
        {children}
      </Component>
    );
  }

  return <Component className={className}>{children}</Component>;
};

export default ConfidentialValue;
