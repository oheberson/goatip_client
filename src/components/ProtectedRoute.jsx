"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requireSubscription = false, allowDemo = false }) {
  const { user, loading, isSubscribed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/subscribe');
        return;
      }
      
      // If requireSubscription is true and allowDemo is false, redirect to subscribe
      if (requireSubscription && !allowDemo && !isSubscribed) {
        router.replace('/subscribe');
        return;
      }
      
      // If requireSubscription is true and allowDemo is true, allow access but show demo content
      // This is handled by the component itself
    }
  }, [user, loading, isSubscribed, requireSubscription, allowDemo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // If requireSubscription is true, allowDemo is false, and user is not subscribed, redirect
  if (requireSubscription && !allowDemo && !isSubscribed) {
    return null; // Will redirect to subscribe
  }

  return children;
}
