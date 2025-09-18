"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function CheckoutReturnContent() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const router = useRouter();

  useEffect(() => {
    const fetchSessionStatus = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/session-status?session_id=${sessionId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch session status');
        }

        const data = await res.json();
        setSessionData(data);
        setLoading(false);

        if (data.status === 'complete') {
          // Redirect to home after short delay
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (err) {
        console.error('Error fetching session status:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSessionStatus();
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking payment status...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              {error || 'Something went wrong. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/auth/subscribe')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = sessionData.status === 'complete' && sessionData.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isSuccess ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                Your subscription is now active. Redirecting to dashboard...
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Payment {sessionData.status}</CardTitle>
              <CardDescription>
                Status: {sessionData.payment_status}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {sessionData.customer_email && (
            <p className="text-sm text-muted-foreground">
              Email: {sessionData.customer_email}
            </p>
          )}
          
          {isSuccess ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You now have access to all premium features!
              </p>
              <Button onClick={() => router.push('/')} className="w-full">
                Go to Home
              </Button>
            </div>
          ) : (
            <Button onClick={() => router.push('/subscribe')} variant="outline">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CheckoutReturnContent />
    </Suspense>
  );
}
