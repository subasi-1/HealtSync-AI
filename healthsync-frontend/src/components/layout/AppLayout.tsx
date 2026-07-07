import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AIAssistantChat } from '../ai-assistant/AIAssistantChat';
import { cn } from '../../utils';

export const AppLayout: React.FC = () => {
  const { currentUser, isChatOpen, toasts, removeToast } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Simple route guarding. If user not logged in, redirect to authentication console.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Collapsible left navigation panel */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main operational shell */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 transition-all duration-300 md:p-6">
          <div className={cn(
            "mx-auto max-w-7xl space-y-6 transition-all duration-300",
            isChatOpen && "pr-0 lg:pr-[24px]" // Slight padding adjustment for chat drawer overlay
          )}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Slide out AI Operations Assistant drawer */}
      <AIAssistantChat />

      {/* Toast notifications portal stack */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-xs sm:max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between rounded-md border px-3.5 py-2.5 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4",
              t.type === 'success' && "bg-success border-success/20 text-white",
              t.type === 'error' && "bg-destructive border-destructive/20 text-white",
              t.type === 'info' && "bg-primary border-primary/20 text-white"
            )}
          >
            <span className="text-xs font-bold leading-tight">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 hover:opacity-80 text-white/90 text-sm font-black leading-none select-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
