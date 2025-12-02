"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { clearGoatipAppData } from '@/lib/localStorage-utils';

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
  const [isSubscribed, setIsSubscribed] = useState(true); // Always true - free access
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [trialInfo, setTrialInfo] = useState(null);

  // Free access mode - bypass all authentication and subscription checks
  useEffect(() => {
    // Set a dummy user and always mark as subscribed
    setUser({
      id: 'free-user',
      email: 'user@goatip.app',
      user_metadata: { name: 'User' }
    });
    setIsSubscribed(true);
    setIsFreeTrial(false);
    setTrialInfo(null);
    setLoading(false);
    
    // Note: We're not checking actual authentication or subscription status
    // All users are treated as having full access
  }, []);

  const checkSubscription = async (email) => {
    // Free access mode - always return as subscribed
    setIsSubscribed(true);
    return { isSubscribed: true };
  };

  const checkFreeTrial = async (email) => {
    // Free access mode - no free trial needed, everyone has full access
    setIsFreeTrial(false);
    setTrialInfo(null);
    return { isFreeTrial: false };
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
    console.log('🧹 Signing out, clearing app data');
    clearGoatipAppData();
    
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
