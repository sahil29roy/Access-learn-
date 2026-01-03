import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Authentication Context
 * Manages user authentication state, session tracking, and auto-logout
 */

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  last_login_at: string | null;
  last_logout_at: string | null;
  total_active_minutes: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  currentSessionId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }, []);

  // Create a new learning session
  const createSession = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        login_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return null;
    }

    // Update user's last login time
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    return data?.id || null;
  }, []);

  // Close the current session and calculate duration
  const closeSession = useCallback(async (sessionId: string, userId: string) => {
    try {
      // Get session start time
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('login_at')
        .eq('id', sessionId)
        .single();

      if (!sessionData) return;

      const loginAt = new Date(sessionData.login_at);
      const logoutAt = new Date();
      const durationMinutes = Math.round((logoutAt.getTime() - loginAt.getTime()) / (1000 * 60));

      // Update session with logout time and duration
      await supabase
        .from('sessions')
        .update({
          logout_at: logoutAt.toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq('id', sessionId);

      // Update user's total active time and last logout
      const { data: profileData } = await supabase
        .from('profiles')
        .select('total_active_minutes')
        .eq('id', userId)
        .single();

      if (profileData) {
        await supabase
          .from('profiles')
          .update({
            last_logout_at: logoutAt.toISOString(),
            total_active_minutes: (profileData.total_active_minutes || 0) + durationMinutes,
          })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch profile on sign in (deferred to avoid deadlock)
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(async () => {
            const userProfile = await fetchProfile(currentSession.user.id);
            setProfile(userProfile);

            // Create a new learning session
            const sessionId = await createSession(currentSession.user.id);
            setCurrentSessionId(sessionId);
            
            // Store session ID for auto-logout
            if (sessionId) {
              sessionStorage.setItem('learning_session_id', sessionId);
              sessionStorage.setItem('user_id', currentSession.user.id);
            }
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setCurrentSessionId(null);
          sessionStorage.removeItem('learning_session_id');
          sessionStorage.removeItem('user_id');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        const userProfile = await fetchProfile(existingSession.user.id);
        setProfile(userProfile);

        // Check for existing session ID or create new one
        const storedSessionId = sessionStorage.getItem('learning_session_id');
        if (storedSessionId) {
          setCurrentSessionId(storedSessionId);
        } else {
          const newSessionId = await createSession(existingSession.user.id);
          setCurrentSessionId(newSessionId);
          if (newSessionId) {
            sessionStorage.setItem('learning_session_id', newSessionId);
            sessionStorage.setItem('user_id', existingSession.user.id);
          }
        }
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, createSession]);

  // Auto-logout on tab close/refresh using beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionId = sessionStorage.getItem('learning_session_id');
      const userId = sessionStorage.getItem('user_id');

      if (sessionId && userId) {
        // Use sendBeacon for reliable logout on tab close
        const payload = JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          logout_at: new Date().toISOString(),
        });

        // sendBeacon is more reliable for unload events
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/close-session`,
          payload
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password. Please try again.' };
        }
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { error: 'This email is already registered. Please login instead.' };
        }
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  // Logout function
  const logout = async () => {
    // Close the current learning session
    if (currentSessionId && user) {
      await closeSession(currentSessionId, user.id);
    }

    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    currentSessionId,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
