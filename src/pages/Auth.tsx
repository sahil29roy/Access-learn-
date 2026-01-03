import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Loader } from '@/components/common/Loader';
import { AccessibilityControls } from '@/components/common/AccessibilityControls';
import { TextToSpeech } from '@/components/common/TextToSpeech';
import { SkipLink } from '@/components/common/SkipLink';
import { GraduationCap, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';

/**
 * Auth Page - Login & Signup
 * Fully accessible authentication page with:
 * - Keyboard navigation
 * - Screen reader support
 * - Text-to-Speech for instructions
 * - High contrast support
 * - Form validation
 */

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const AuthPage: React.FC = () => {
  const { isAuthenticated, isLoading, login, signup } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return <Loader fullScreen label="Loading..." />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        // Validate login
        const result = loginSchema.safeParse({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await login(formData.email, formData.password);
        if (error) {
          setGeneralError(error);
        }
      } else {
        // Validate signup
        const result = signupSchema.safeParse(formData);

        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signup(formData.email, formData.password, formData.name);
        if (error) {
          setGeneralError(error);
        }
      }
    } catch (err) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setGeneralError(null);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const pageDescription = isLoginMode
    ? 'Welcome back! Please enter your email and password to login to your account and continue your learning journey.'
    : 'Create your account to start your accessible learning experience. Please fill in your name, email, and create a password.';

  return (
    <>
      <SkipLink />
      
      <div className="min-h-screen gradient-hero">
        {/* Header with accessibility controls */}
        <header className="bg-card border-b-2 border-border">
          <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity"
              aria-label="AccessLearn - Home"
            >
              <GraduationCap className="w-10 h-10" aria-hidden="true" />
              <span className="text-2xl font-bold">AccessLearn</span>
            </Link>
            
            <AccessibilityControls />
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-lg mx-auto">
            {/* Page title */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-xl text-muted-foreground">
                {isLoginMode
                  ? 'Login to continue your learning journey'
                  : 'Start your accessible learning experience'}
              </p>
            </div>

            {/* Text-to-Speech for page description */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <TextToSpeech
                text={pageDescription}
                label="Read instructions"
                showControls={false}
              />
            </div>

            {/* Auth form card */}
            <div
              className="a11y-card animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* General error message */}
                {generalError && (
                  <div
                    className="bg-destructive/10 border-2 border-destructive rounded-xl p-4 flex items-start gap-3"
                    role="alert"
                    aria-live="assertive"
                  >
                    <svg
                      className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5"
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
                    <p className="text-destructive font-medium">{generalError}</p>
                  </div>
                )}

                {/* Name field (signup only) */}
                {!isLoginMode && (
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                  />
                )}

                {/* Email field */}
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />

                {/* Password field */}
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  hint={!isLoginMode ? 'Must be at least 6 characters' : undefined}
                  required
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                />

                {/* Confirm password (signup only) */}
                {!isLoginMode && (
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                  />
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  leftIcon={
                    isLoginMode ? (
                      <LogIn className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <UserPlus className="w-5 h-5" aria-hidden="true" />
                    )
                  }
                >
                  {isLoginMode ? 'Login' : 'Create Account'}
                </Button>
              </form>

              {/* Toggle between login/signup */}
              <div className="mt-8 pt-6 border-t-2 border-border text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  {isLoginMode
                    ? "Don't have an account?"
                    : 'Already have an account?'}
                </p>
                <Button
                  variant="outline"
                  onClick={toggleMode}
                  fullWidth
                >
                  {isLoginMode ? 'Create Account' : 'Login Instead'}
                </Button>
              </div>
            </div>

            {/* Back to home link */}
            <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/"
                className="text-lg text-primary hover:underline focus:underline inline-flex items-center gap-2"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthPage;
