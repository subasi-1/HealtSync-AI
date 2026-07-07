import React from 'react';
import { cn } from '../../utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'acrylic' | 'outlined' | 'interactive';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground transition-all duration-200 duration-350',
        {
          'border-border/80 bg-card fluent-shadow-md': variant === 'default',
          'acrylic shadow-fluentSm border-border/40': variant === 'acrylic',
          'border-border bg-transparent shadow-none': variant === 'outlined',
          'border-border/80 bg-card cursor-pointer hover:fluent-shadow-lg hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:fluent-shadow-md': variant === 'interactive' || hoverEffect,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
