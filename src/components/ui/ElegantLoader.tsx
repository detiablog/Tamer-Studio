'use client';

import React from 'react';

/**
 * Elegant Loading Component for Tamer Studio
 * - Smooth animations
 * - Premium feel
 * - Reflects Tamer Studio branding
 */
export function ElegantLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-30 animation-delay-2000" />
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Logo / Brand mark */}
        <div className="flex items-center justify-center">
          <div className="relative w-16 h-16">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin duration-3000" style={{ animationDuration: '3s' }} />

            {/* Middle rotating ring - reverse direction */}
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-primary/40 border-l-primary/30 animate-spin duration-5000" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />

            {/* Inner glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Loading text with smooth fade animation */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground tracking-tight">
            <span className="inline-block animate-pulse">Loading</span>
            <span className="inline-flex gap-1 ml-1">
              <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </h3>
          <p className="text-sm text-muted-foreground font-light tracking-wide">
            Initializing Tamer Studio
          </p>
        </div>

        {/* Progress indicator */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary/0 via-primary to-primary/0 animate-shimmer" style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite'
          }} />
        </div>
      </div>

      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        @supports (animation-timeline: view()) {
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact Loading Component for modals and sections
 */
export function CompactLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      {/* Compact spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-muted border-t-primary animate-spin" />
        <div className="absolute inset-1.5 rounded-full border border-muted border-t-primary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
        </div>
      </div>

      {/* Compact text */}
      <p className="text-sm text-muted-foreground font-light">
        Loading
        <span className="inline-flex gap-0.5 ml-1">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        </span>
      </p>
    </div>
  );
}

/**
 * Mini Loading Component for inline use
 */
export function MiniLoader() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      <span className="text-xs text-muted-foreground">Loading</span>
    </div>
  );
}
