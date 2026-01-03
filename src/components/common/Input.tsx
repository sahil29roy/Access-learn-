import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Accessible Input Component
 * Features:
 * - Large touch target (48px height)
 * - Clear labels and error states
 * - Screen reader announcements
 * - High contrast focus indicators
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, hideLabel, id, type = 'text', ...props }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="w-full space-y-2">
        {/* Label - always present for screen readers */}
        <label
          htmlFor={inputId}
          className={cn(
            "block text-lg font-bold text-foreground",
            hideLabel && "sr-only"
          )}
        >
          {label}
          {props.required && (
            <span className="text-destructive ml-1" aria-hidden="true">*</span>
          )}
        </label>

        {/* Hint text */}
        {hint && (
          <p id={hintId} className="text-base text-muted-foreground">
            {hint}
          </p>
        )}

        {/* Input field */}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={cn(
            // Base styles
            "w-full px-5 py-4 text-lg rounded-xl border-2 bg-background",
            "placeholder:text-muted-foreground",
            "transition-all duration-200",
            "min-h-touch",
            // Focus styles
            "focus:outline-none focus:ring-4 focus:ring-offset-2",
            // Default border
            "border-input focus:border-primary focus:ring-primary/20",
            // Error styles
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            error && errorId,
            hint && hintId
          ) || undefined}
          {...props}
        />

        {/* Error message with live announcement */}
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-2 text-base font-medium text-destructive"
            role="alert"
            aria-live="polite"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
