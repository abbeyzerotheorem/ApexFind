'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage('Signed in successfully! Redirecting...');
            router.push('/dashboard');
            router.refresh(); 
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
                            onChange={(e) => setEmail(e.target.value)}
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
            </CardContent>
        </Card>
    );
}

function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for a confirmation link to complete your sign up.');
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Enter your email and password to create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
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
