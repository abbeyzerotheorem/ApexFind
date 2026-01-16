'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Authenticating...');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard');
        router.refresh();
      } else if (event === 'PASSWORD_RECOVERY') {
        // This event is triggered when the user follows a password recovery link.
        // Supabase handles the session creation, and we can now prompt for a new password.
        setMessage('Create a new password for your account.');
        setShowPasswordForm(true);
      }
    });

    const checkInitialSession = async () => {
      // It's possible the user is already signed in when they land here.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/dashboard');
        router.refresh();
      }
    };

    // The PASSWORD_RECOVERY event might not fire if the page loads after the URL fragment is processed.
    // However, Supabase client will have the session from the recovery token.
    // If there's a session but no user details, it's likely a password recovery flow.
    // But the onAuthStateChange is the most reliable way. We still check for an existing session for direct navigators.
    if (!window.location.hash.includes('type=recovery')) {
        checkInitialSession();
    }


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Updating password...');
    const { error } = await supabase.auth.updateUser({ password });
    
    setIsSubmitting(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Password updated successfully! Redirecting to sign in...');
      setTimeout(() => router.push('/auth'), 3000);
    }
  };


  if (showPasswordForm) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
            <h1 className="text-xl text-foreground">Update Your Password</h1>
            <p className="text-sm text-muted-foreground max-w-sm text-center">{message}</p>
            <form onSubmit={handleUpdatePassword} className="w-full max-w-sm space-y-4 p-4">
                <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
            </form>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <h1 className="text-xl text-muted-foreground">{message}</h1>
      <p className="text-muted-foreground">Please wait while we process your request.</p>
    </div>
  );
}
