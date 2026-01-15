'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // The `SIGNED_IN` event is triggered after a successful login or sign-up confirmation.
      if (event === 'SIGNED_IN') {
        // Redirect the user to their dashboard.
        router.push('/dashboard');
        router.refresh(); // Force a refresh to ensure server components re-render with the new session.
      }
    });

    // It's also possible the user is already signed in when they land here.
    // Let's check for an existing session.
    const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            router.push('/dashboard');
            router.refresh();
        }
    }
    checkSession();


    // Cleanup the listener when the component unmounts.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <h1 className="text-xl text-muted-foreground">Authenticating...</h1>
      <p className="text-muted-foreground">Please wait while we redirect you.</p>
    </div>
  );
}
