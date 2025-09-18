"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkSubscription(session.user.email);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkSubscription(session.user.email);
        } else {
          setIsSubscribed(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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

  const signInWithMagicLink = async (email) => {
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

  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      setIsSubscribed(false);
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setIsSubscribed(false);
    }
    return { error };
  };

  const value = {
    user,
    loading,
    isSubscribed,
    signInWithMagicLink,
    signOut,
    checkSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
