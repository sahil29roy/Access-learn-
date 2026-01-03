import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Accessible Loading Spinner
 * Features:
 * - Screen reader announcement
 * - Respects reduced motion preference
 * - High contrast colors
 */
interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  label = 'Loading, please wait...',
  className,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const Spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "min-h-screen",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Spinner animation - respects prefers-reduced-motion via CSS */}
      <div
        className={cn(
          "rounded-full border-primary/30 border-t-primary animate-spin",
          "motion-reduce:animate-none motion-reduce:border-primary",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      
      {/* Screen reader text */}
      <span className="text-lg font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {Spinner}
      </div>
    );
  }

  return Spinner;
};

export { Loader };
