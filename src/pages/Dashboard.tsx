import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { AccessibilityControls } from '@/components/common/AccessibilityControls';
import { TextToSpeech } from '@/components/common/TextToSpeech';
import { SkipLink } from '@/components/common/SkipLink';
import { supabase } from '@/integrations/supabase/client';
import {
  GraduationCap,
  LogOut,
  Clock,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * Dashboard Page
 * Displays student learning summary with full accessibility
 * Features:
 * - Student name and profile
 * - Last login time
 * - Total active learning time
 * - Current session status
 * - Text-to-Speech for dashboard summary
 */

interface SessionData {
  id: string;
  login_at: string;
  logout_at: string | null;
  duration_minutes: number | null;
}

const Dashboard: React.FC = () => {
  const { user, profile, isLoading, isAuthenticated, logout, currentSessionId } = useAuth();
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(0);

  // Fetch recent sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('login_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentSessions(data);
      }
      setIsLoadingSessions(false);
    };

    fetchSessions();
  }, [user]);

  // Track current session duration
  useEffect(() => {
    if (!currentSessionId) return;

    const interval = setInterval(() => {
      setCurrentSessionDuration((prev) => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentSessionId]);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return <Loader fullScreen label="Loading your dashboard..." />;
  }

  const handleLogout = async () => {
    await logout();
  };

  // Format times for display
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins > 0 ? `and ${mins} minute${mins !== 1 ? 's' : ''}` : ''}`;
  };

  const lastLoginFormatted = profile?.last_login_at
    ? format(new Date(profile.last_login_at), 'EEEE, MMMM do, yyyy at h:mm a')
    : 'First login';

  const totalTimeFormatted = formatTime(profile?.total_active_minutes || 0);

  // Generate dashboard summary for TTS
  const dashboardSummary = `
    Welcome ${profile?.name || 'Student'}! 
    This is your learning dashboard. 
    You have spent a total of ${totalTimeFormatted} learning on this platform. 
    Your last login was on ${lastLoginFormatted}. 
    You are currently in an active learning session. 
    Keep up the great work!
  `;

  return (
    <>
      <SkipLink />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <GraduationCap className="w-10 h-10" aria-hidden="true" />
                <span className="text-2xl font-bold">AccessLearn</span>
              </div>

              {/* User info and logout */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-primary-foreground/80">
                  <User className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">{profile?.name || 'Student'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" aria-hidden="true" />}
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Accessibility controls bar */}
        <div className="bg-card border-b-2 border-border">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
            <span className="text-lg font-bold text-foreground">Accessibility Options</span>
            <AccessibilityControls />
          </div>
        </div>

        {/* Main content */}
        <main id="main-content" className="container mx-auto px-4 py-8">
          {/* Welcome section with TTS */}
          <section className="mb-8 animate-fade-in">
            <div className="a11y-card gradient-primary text-primary-foreground">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Welcome, {profile?.name || 'Student'}!
                  </h1>
                  <p className="text-xl text-primary-foreground/80">
                    Your personalized learning dashboard
                  </p>
                </div>
                <TextToSpeech
                  text={dashboardSummary}
                  label="Read dashboard summary"
                  showControls={false}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </section>

          {/* Stats grid */}
          <section className="mb-8" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">
              Your Learning Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total learning time */}
              <article
                className="a11y-card animate-slide-up"
                style={{ animationDelay: '0.1s' }}
                aria-label="Total learning time"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary">
                    <Clock className="w-8 h-8 text-secondary-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-muted-foreground mb-1">
                      Total Learning Time
                    </h3>
                    <p className="text-3xl font-bold text-foreground">
                      {totalTimeFormatted}
                    </p>
                  </div>
                </div>
              </article>

              {/* Last login */}
              <article
                className="a11y-card animate-slide-up"
                style={{ animationDelay: '0.2s' }}
                aria-label="Last login"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent">
                    <Calendar className="w-8 h-8 text-accent-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-muted-foreground mb-1">
                      Last Login
                    </h3>
                    <p className="text-xl font-bold text-foreground">
                      {profile?.last_login_at
                        ? format(new Date(profile.last_login_at), 'MMM d, yyyy')
                        : 'Just now'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      {profile?.last_login_at
                        ? format(new Date(profile.last_login_at), 'h:mm a')
                        : 'Welcome!'}
                    </p>
                  </div>
                </div>
              </article>

              {/* Session status */}
              <article
                className="a11y-card animate-slide-up"
                style={{ animationDelay: '0.3s' }}
                aria-label="Current session status"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-success">
                    <Activity className="w-8 h-8 text-success-foreground" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-muted-foreground mb-1">
                      Session Status
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-success animate-pulse-gentle" aria-hidden="true" />
                      <p className="text-xl font-bold text-success">Active</p>
                    </div>
                    {currentSessionDuration > 0 && (
                      <p className="text-base text-muted-foreground">
                        {formatTime(currentSessionDuration)} this session
                      </p>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* Learning content section */}
          <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="a11y-card">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-primary" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-foreground">
                  Learning Content
                </h2>
              </div>

              <div className="bg-muted rounded-xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Introduction to Accessible Learning
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Welcome to AccessLearn, a platform designed specifically for students with physical and visual disabilities. Our platform features text-to-speech capabilities, high contrast modes, keyboard navigation, and adjustable font sizes to ensure everyone can learn comfortably.
                </p>
                <TextToSpeech
                  text="Welcome to AccessLearn, a platform designed specifically for students with physical and visual disabilities. Our platform features text-to-speech capabilities, high contrast modes, keyboard navigation, and adjustable font sizes to ensure everyone can learn comfortably."
                  label="Read this content"
                  showControls
                />
              </div>
            </div>
          </section>

          {/* Recent sessions */}
          <section
            className="animate-slide-up"
            style={{ animationDelay: '0.5s' }}
            aria-labelledby="sessions-heading"
          >
            <div className="a11y-card">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-primary" aria-hidden="true" />
                <h2 id="sessions-heading" className="text-2xl font-bold text-foreground">
                  Recent Learning Sessions
                </h2>
              </div>

              {isLoadingSessions ? (
                <Loader label="Loading sessions..." />
              ) : recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {session.logout_at ? (
                          <CheckCircle className="w-6 h-6 text-success" aria-hidden="true" />
                        ) : (
                          <Activity className="w-6 h-6 text-primary animate-pulse" aria-hidden="true" />
                        )}
                        <div>
                          <p className="font-bold text-foreground">
                            {format(new Date(session.login_at), 'EEEE, MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Started at {format(new Date(session.login_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {session.duration_minutes !== null ? (
                          <p className="font-bold text-foreground">
                            {formatTime(session.duration_minutes)}
                          </p>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                            Active Now
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-lg text-muted-foreground text-center py-8">
                  No previous sessions found. Start learning to track your progress!
                </p>
              )}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t-2 border-border mt-8">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="text-muted-foreground">
              AccessLearn - Making education accessible for everyone
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Dashboard;
