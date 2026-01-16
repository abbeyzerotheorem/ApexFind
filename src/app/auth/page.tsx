
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { signIn, signUp, resetPasswordForEmail } from '@/lib/auth';

export default function AuthPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
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
            <Footer />
        </div>
    )
}

function SignInForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            await signIn(email, password);
            setMessage('Signed in successfully! Redirecting...');
            router.push('/dashboard');
            router.refresh(); 
        } catch (error: any) {
            setMessage(error.message);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            setResetMessage('Please enter an email address.');
            return;
        }
        setIsResetting(true);
        setResetMessage('Sending password reset email...');
    
        try {
            await resetPasswordForEmail(resetEmail);
            setResetMessage('Password reset email sent. Please check your inbox.');
        } catch (error: any) {
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
                    {message && <p className="text-sm text-center text-muted-foreground pt-2">{message}</p>}
                </form>
                <div className="text-center mt-4">
                    <Dialog onOpenChange={() => setResetMessage('')}>
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
                                {resetMessage && <p className="text-sm text-center text-muted-foreground pt-2">{resetMessage}</p>}
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}

function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
        await signUp(name, email, password);
        setMessage('Check your email for a confirmation link to complete your sign up.');
    } catch (error: any) {
        setMessage(error.message);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Enter your details to create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
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
                {message && <p className="text-sm text-center text-muted-foreground pt-2">{message}</p>}
            </form>
        </CardContent>
    </Card>
  );
}
