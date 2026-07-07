import React from 'react';
import { cn } from '../../utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline' | 'epidemic';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'bg-primary/10 text-primary hover:bg-primary/20': variant === 'default',
          'bg-success/15 text-success dark:bg-success/20 dark:text-success-foreground': variant === 'success',
          'bg-warning/15 text-warning dark:bg-warning/20 dark:text-warning-foreground': variant === 'warning',
          'bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground': variant === 'destructive',
          'bg-info/15 text-info dark:bg-info/20 dark:text-info-foreground': variant === 'info',
          'bg-epidemic/15 text-epidemic dark:bg-epidemic/20 dark:text-epidemic-foreground': variant === 'epidemic',
          'border border-border text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
