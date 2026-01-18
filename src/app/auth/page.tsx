
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { signIn, signUp, resetPasswordForEmail, signInWithGoogle } from '@/lib/auth';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export default function AuthPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading || user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <h1 className="text-xl text-muted-foreground">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-grow flex items-center justify-center py-12 sm:py-16">
                <Tabs defaultValue="signin" className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signin">
                        <SignInForm />
                    </TabsContent>
                    <TabsContent value="signup">
                        <SignUpForm />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}

function SignInForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [isResetError, setIsResetError] = useState(false);

    const handleGoogleSignIn = async () => {
        setMessage('');
        setIsError(false);
        try {
            await signInWithGoogle();
            setMessage('Signed in successfully! Redirecting...');
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            setIsError(true);
            setMessage(error.message);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            await signIn(email, password);
            setMessage('Signed in successfully! Redirecting...');
            router.push('/dashboard');
            router.refresh(); 
        } catch (error: any) {
            setIsError(true);
            if (error.code === 'auth/invalid-credential') {
                setMessage('Incorrect email or password. Please try again or choose forgot password.');
            } else {
                setMessage(error.message);
            }
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetError(false);
        if (!resetEmail) {
            setIsResetError(true);
            setResetMessage('Please enter an email address.');
            return;
        }
        setIsResetting(true);
        setResetMessage('Sending password reset email...');
    
        try {
            await resetPasswordForEmail(resetEmail);
            setIsResetError(false);
            setResetMessage('Password reset email sent. Please check your inbox.');
        } catch (error: any) {
            setIsResetError(true);
            setResetMessage(error.message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                     <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 58.2l-64.4 64.4C325.8 99.8 289.4 86 248 86c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c94.9 0 132.3-62.2 135.8-94.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                        Sign in with Google
                    </Button>
                </div>
                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                            id="signin-email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (!resetEmail) {
                                    setResetEmail(e.target.value);
                                }
                            }}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <Input
                            id="signin-password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">Sign In</Button>
                    {message && <p className={cn("text-sm text-center pt-2", isError ? "text-destructive" : "text-muted-foreground")}>{message}</p>}
                </form>
                <div className="text-center mt-4">
                    <Dialog onOpenChange={() => { setResetMessage(''); setIsResetError(false); }}>
                        <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto font-normal text-sm">
                                Forgot Password?
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                    Enter your email address below. We'll send you a link to reset your password.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email" className="sr-only">Email</Label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                 <Button type="submit" className="w-full" disabled={isResetting}>
                                    {isResetting ? 'Sending...' : 'Send Reset Link'}
                                 </Button>
                                {resetMessage && <p className={cn("text-sm text-center pt-2", isResetError ? "text-destructive" : "text-muted-foreground")}>{resetMessage}</p>}
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}

function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'agent'>('customer');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleGoogleSignUp = async () => {
    setMessage('');
    setIsError(false);
    try {
        await signInWithGoogle();
        setMessage('Signed in successfully! Redirecting...');
        router.push('/dashboard');
        router.refresh();
    } catch (error: any) {
        setIsError(true);
        setMessage(error.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
        await signUp(name, email, password, role);
        setMessage('Check your email for a confirmation link to complete your sign up. Note: This is a demo app, you might not receive an email.');
    } catch (error: any) {
        setIsError(true);
        if (error.code === 'auth/email-already-in-use') {
            setMessage('An account with this email address already exists.');
        } else if (error.code === 'auth/weak-password') {
            setMessage('Password is too weak. It should be at least 6 characters long.');
        } else {
            setMessage(error.message);
        }
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Enter your details to create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignUp}>
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 58.2l-64.4 64.4C325.8 99.8 289.4 86 248 86c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c94.9 0 132.3-62.2 135.8-94.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                    Sign up with Google
                </Button>
            </div>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or continue with email
                    </span>
                </div>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                    <Label>I am a...</Label>
                    <RadioGroup defaultValue="customer" onValueChange={(value) => setRole(value as 'customer' | 'agent')} className="flex gap-4 pt-1">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="customer" id="role-customer" />
                            <Label htmlFor="role-customer" className="font-normal">Home Buyer / Renter</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="agent" id="role-agent" />
                            <Label htmlFor="role-agent" className="font-normal">Real Estate Agent</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                        id="signup-name"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                        id="signup-email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                        id="signup-password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full">Sign Up</Button>
                {message && <p className={cn("text-sm text-center pt-2", isError ? "text-destructive" : "text-muted-foreground")}>{message}</p>}
            </form>
        </CardContent>
    </Card>
  );
}
