import React from 'react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center space-y-4 text-center">
        {/* Pulse animate container */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-fluentLg animate-pulse">
          <Logo size={42} />
        </div>
        {/* Brand Name */}
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          HealthSync AI
        </h2>
        {/* Subtitle */}
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          AI-Driven Health Center &amp; Supply Chain Management
        </p>
        {/* Native Tailwind loader dots */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
export default LoadingScreen;
