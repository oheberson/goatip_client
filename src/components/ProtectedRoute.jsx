"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requireSubscription = false }) {
  const { user, loading, isSubscribed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/subscribe');
        return;
      }
      
      if (requireSubscription && !isSubscribed) {
        router.replace('/subscribe');
        return;
      }
    }
  }, [user, loading, isSubscribed, requireSubscription, router]);

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

  if (requireSubscription && !isSubscribed) {
    return null; // Will redirect to subscribe
  }

  return children;
}
