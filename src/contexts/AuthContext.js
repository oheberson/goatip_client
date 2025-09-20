"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { clearAllGoatipStorage } from '@/lib/localStorage-utils';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [trialInfo, setTrialInfo] = useState(null);

  // Development bypass - when NEXT_PUBLIC_ENVIRONMENT is 'development'
  const isDevelopmentMode = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';

  useEffect(() => {
    // Development mode bypass
    if (isDevelopmentMode) {
      console.log('🔧 Development mode: Bypassing authentication checks');
      setUser({
        id: 'dev-user-123',
        email: 'developer@goatip.local',
        user_metadata: { name: 'Developer' }
      });
      setIsSubscribed(true);
      setIsFreeTrial(false);
      setTrialInfo(null);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await Promise.all([
          checkSubscription(session.user.email),
          checkFreeTrial(session.user.email)
        ]);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes (only in production)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip auth state changes in development mode
        if (isDevelopmentMode) return;
        
        // Clear localStorage when user signs in to prevent session conflicts
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🧹 User signed in, clearing localStorage for clean session');
          clearAllGoatipStorage();
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await Promise.all([
            checkSubscription(session.user.email),
            checkFreeTrial(session.user.email)
          ]);
        } else {
          setIsSubscribed(false);
          setIsFreeTrial(false);
          setTrialInfo(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isDevelopmentMode]);

  const checkSubscription = async (email) => {
    try {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsSubscribed(result.isSubscribed);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    }
  };

  const checkFreeTrial = async (email) => {
    try {
      const response = await fetch('/api/check-free-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsFreeTrial(result.isFreeTrial);
        if (result.isFreeTrial) {
          setTrialInfo({
            expiresAt: result.expiresAt,
            daysRemaining: result.daysRemaining
          });
        } else {
          setTrialInfo(null);
        }
      } else {
        setIsFreeTrial(false);
        setTrialInfo(null);
      }
    } catch (error) {
      console.error('Error checking free trial:', error);
      setIsFreeTrial(false);
      setTrialInfo(null);
    }
  };

  const signInWithMagicLink = async (email) => {
    // In development mode, always succeed
    if (isDevelopmentMode) {
      console.log('🔧 Development mode: Magic link sign-in bypassed');
      return { error: null };
    }
    
    if (!supabase) {
      return { error: { message: 'Authentication not configured' } };
    }
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const startFreeTrial = async (email) => {
    try {
      const response = await fetch('/api/start-free-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh free trial status
          await checkFreeTrial(email);
          return { success: true, data: result };
        } else {
          return { success: false, error: result.error };
        }
      } else {
        return { success: false, error: 'Failed to start free trial' };
      }
    } catch (error) {
      console.error('Error starting free trial:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    // Clear localStorage when signing out
    console.log('🧹 Signing out, clearing localStorage');
    clearAllGoatipStorage();
    
    // In development mode, just clear the state
    if (isDevelopmentMode) {
      console.log('🔧 Development mode: Sign out bypassed');
      setUser(null);
      setIsSubscribed(false);
      setIsFreeTrial(false);
      setTrialInfo(null);
      return { error: null };
    }
    
    if (!supabase) {
      setUser(null);
      setIsSubscribed(false);
      setIsFreeTrial(false);
      setTrialInfo(null);
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setIsSubscribed(false);
      setIsFreeTrial(false);
      setTrialInfo(null);
    }
    return { error };
  };

  const value = {
    user,
    loading,
    isSubscribed,
    isFreeTrial,
    trialInfo,
    signInWithMagicLink,
    signOut,
    checkSubscription,
    checkFreeTrial,
    startFreeTrial,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
