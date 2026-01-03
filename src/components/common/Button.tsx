import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Accessible Button Component
 * Follows WCAG 2.1 guidelines with:
 * - 48px minimum touch target
 * - High contrast colors
 * - Clear focus indicators
 * - Screen reader support
 */
const buttonVariants = cva(
  // Base styles for all buttons
  [
    "inline-flex items-center justify-center gap-3",
    "font-bold text-lg rounded-xl",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "min-h-touch min-w-touch px-6 py-4",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary-hover active:scale-[0.98]",
          "focus-visible:ring-primary/50",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:brightness-110 active:scale-[0.98]",
          "focus-visible:ring-secondary/50",
        ].join(" "),
        outline: [
          "border-2 border-primary text-primary bg-transparent",
          "hover:bg-primary hover:text-primary-foreground",
          "focus-visible:ring-primary/50",
        ].join(" "),
        ghost: [
          "text-foreground bg-transparent",
          "hover:bg-muted",
          "focus-visible:ring-muted-foreground/50",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:brightness-110 active:scale-[0.98]",
          "focus-visible:ring-destructive/50",
        ].join(" "),
        success: [
          "bg-success text-success-foreground",
          "hover:brightness-110 active:scale-[0.98]",
          "focus-visible:ring-success/50",
        ].join(" "),
        // Special variant for Text-to-Speech button
        tts: [
          "bg-accent text-accent-foreground",
          "hover:brightness-110 active:scale-[0.98]",
          "focus-visible:ring-accent/50",
          "animate-pulse-gentle hover:animate-none",
        ].join(" "),
      },
      size: {
        sm: "min-h-[40px] px-4 py-2 text-base",
        md: "min-h-touch px-6 py-4 text-lg",
        lg: "min-h-[56px] px-8 py-5 text-xl",
        icon: "min-h-touch min-w-touch p-3",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
