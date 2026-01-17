
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateUserPassword } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Authenticating...');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMessage('Create a new password for your account.');
        setShowPasswordForm(true);
      } else if (event === 'SIGNED_IN') {
        if (!window.location.hash.includes('type=recovery')) {
          router.push('/dashboard');
          router.refresh();
        }
      }
    });

    const checkInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && !window.location.hash.includes('type=recovery')) {
        router.push('/dashboard');
        router.refresh();
      }
    };

    if (!window.location.hash.includes('type=recovery')) {
        checkInitialSession();
    }


    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('Updating password...');
    
    try {
        await updateUserPassword(password);
        setMessage('Password updated successfully! You will be redirected to sign in...');
        setTimeout(() => router.push('/auth'), 3000);
    } catch (error: any) {
        setMessage(`Error: ${error.message}`);
    } finally {
        setIsSubmitting(false);
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
