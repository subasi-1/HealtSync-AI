import React from 'react';
import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'table' | 'line' | 'circle';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ className, variant = 'line', count = 1 }) => {
  const elements = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn("animate-pulse border border-border bg-card/65 p-4 rounded-xl space-y-3", className)}>
            <div className="h-4 bg-muted/60 rounded w-1/3 shimmer-anim" />
            <div className="h-8 bg-muted rounded w-1/2 shimmer-anim" />
            <div className="h-3.5 bg-muted/65 rounded w-full shimmer-anim" />
          </div>
        );
      case 'table':
        return (
          <div className={cn("animate-pulse space-y-2.5", className)}>
            <div className="h-9 bg-muted/70 rounded-md w-full shimmer-anim" />
            {elements.map((_, idx) => (
              <div key={idx} className="h-10 bg-muted/40 rounded w-full border-b border-border/40 flex items-center px-4 justify-between">
                <div className="h-3 bg-muted rounded w-1/4 shimmer-anim" />
                <div className="h-3 bg-muted rounded w-1/6 shimmer-anim" />
                <div className="h-3 bg-muted rounded w-1/5 shimmer-anim" />
                <div className="h-3.5 bg-muted rounded w-12 shimmer-anim" />
              </div>
            ))}
          </div>
        );
      case 'circle':
        return (
          <div className={cn("animate-pulse bg-muted rounded-full shimmer-anim", className)} />
        );
      case 'line':
      default:
        return (
          <div className="space-y-2">
            {elements.map((_, idx) => (
              <div key={idx} className={cn("animate-pulse h-3.5 bg-muted rounded w-full shimmer-anim", className)} />
            ))}
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};
export default SkeletonLoader;
