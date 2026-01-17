
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateUserPassword } from '@/lib/auth';
import { useUser } from '@/firebase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [message, setMessage] = useState('Authenticating...');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');

    if (mode === 'resetPassword') {
        setMessage('Create a new password for your account.');
        setShowPasswordForm(true);
    } else if (!loading) {
        if (user) {
            router.push('/dashboard');
        } else {
            // This case can happen if the user is not logged in but hits the callback url.
            // Or after password reset, they are redirected here but are not logged in.
            // We can decide to show a message or redirect them to login.
            setMessage('Redirecting to login...');
            setTimeout(() => router.push('/auth'), 2000);
        }
    }
  }, [user, loading, router]);


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
