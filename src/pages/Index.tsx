import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { AccessibilityControls } from '@/components/common/AccessibilityControls';
import { TextToSpeech } from '@/components/common/TextToSpeech';
import { SkipLink } from '@/components/common/SkipLink';
import {
  GraduationCap,
  Volume2,
  Eye,
  Keyboard,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Heart,
} from 'lucide-react';

/**
 * Landing Page - Index
 * Fully accessible landing page showcasing the platform's features
 */

const Index: React.FC = () => {
  const heroDescription = `Welcome to AccessLearn, the educational platform designed for everyone. 
    We believe that education should be accessible to all students, regardless of physical or visual abilities. 
    Our platform features text-to-speech, keyboard navigation, high contrast modes, and adjustable font sizes.
    Start your learning journey today.`;

  const features = [
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Listen to any content with our built-in browser-native speech synthesis. No external services required.',
    },
    {
      icon: Keyboard,
      title: 'Full Keyboard Navigation',
      description: 'Navigate the entire platform using only your keyboard. Tab through elements with clear focus indicators.',
    },
    {
      icon: Eye,
      title: 'High Contrast Mode',
      description: 'Toggle high contrast colors for improved visibility. Adjustable font sizes for comfortable reading.',
    },
  ];

  return (
    <>
      <SkipLink />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b-2 border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity"
                aria-label="AccessLearn - Home"
              >
                <GraduationCap className="w-10 h-10" aria-hidden="true" />
                <span className="text-2xl font-bold">AccessLearn</span>
              </Link>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <AccessibilityControls className="hidden md:flex" />
                <Link to="/auth">
                  <Button variant="primary">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile accessibility controls */}
        <div className="md:hidden bg-muted border-b-2 border-border">
          <div className="container mx-auto px-4 py-3">
            <AccessibilityControls />
          </div>
        </div>

        {/* Main content */}
        <main id="main-content">
          {/* Hero section */}
          <section className="gradient-hero py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Education <span className="text-primary">Accessible</span> to All
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  A learning platform designed for students with physical and visual disabilities. 
                  Full keyboard navigation, text-to-speech, and customizable accessibility options.
                </p>

                {/* TTS for hero */}
                <div className="mb-8">
                  <TextToSpeech
                    text={heroDescription}
                    label="Listen to introduction"
                    showControls={false}
                  />
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/auth">
                    <Button variant="primary" size="lg">
                      Start Learning
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="lg">
                      Login to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Features section */}
          <section className="py-16 bg-card" aria-labelledby="features-heading">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Accessibility-First Features
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Every feature is designed with accessibility as the top priority
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <article
                    key={feature.title}
                    className="a11y-card animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-4 rounded-xl bg-primary inline-block mb-4">
                      <feature.icon
                        className="w-8 h-8 text-primary-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      {feature.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits section */}
          <section className="py-16 bg-background" aria-labelledby="benefits-heading">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
                  Why Choose AccessLearn?
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      icon: CheckCircle,
                      title: 'Track Your Learning Time',
                      description: 'Automatic session tracking shows exactly how much time you spend learning.',
                    },
                    {
                      icon: Users,
                      title: 'Designed for Disabled Students',
                      description: 'Built from the ground up with input from students with various disabilities.',
                    },
                    {
                      icon: BookOpen,
                      title: 'Clean, Distraction-Free Interface',
                      description: 'Focus on learning without visual clutter or confusing navigation.',
                    },
                    {
                      icon: Heart,
                      title: 'No External APIs Required',
                      description: 'All accessibility features work using browser-native APIs. No paid services.',
                    },
                  ].map((benefit, index) => (
                    <div
                      key={benefit.title}
                      className="flex items-start gap-4 p-6 bg-card rounded-xl border-2 border-border animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-3 rounded-xl bg-success flex-shrink-0">
                        <benefit.icon
                          className="w-6 h-6 text-success-foreground"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-lg text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA section */}
          <section className="py-16 gradient-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join AccessLearn today and experience education designed for everyone.
              </p>
              <Link to="/auth">
                <Button
                  variant="secondary"
                  size="lg"
                >
                  Create Your Account
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t-2 border-border py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-primary" aria-hidden="true" />
                <span className="text-xl font-bold text-foreground">AccessLearn</span>
              </div>
              <p className="text-muted-foreground text-center">
                Making education accessible for everyone. © 2024 AccessLearn.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
