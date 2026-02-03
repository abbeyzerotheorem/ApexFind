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
import { Loader2, Eye, EyeOff, MailCheck, ShieldCheck, User, Briefcase, ChevronRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthPage() {
    const { user, loading } = useUser();

    useEffect(() => {
        if (!loading && user && user.emailVerified) {
            window.location.href = '/dashboard';
        }
    }, [user, loading]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <h1 className="text-xl font-bold text-muted-foreground tracking-tight">Initializing Session...</h1>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-primary/5">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6">
                            <Image
                                src="/ApexFindlogo.png"
                                alt="ApexFind Logo"
                                width={40}
                                height={40}
                                className="h-10 w-10"
                            />
                            <span className="text-3xl font-black tracking-tighter text-foreground">ApexFind</span>
                        </Link>
                    </div>

                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="signin" className="rounded-lg font-bold data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                            <TabsTrigger value="signup" className="rounded-lg font-bold data-[state=active]:shadow-sm">Create Account</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signin">
                            <SignInForm />
                        </TabsContent>
                        <TabsContent value="signup">
                            <SignUpForm />
                        </TabsContent>
                    </Tabs>
                    
                    <p className="text-center text-xs text-muted-foreground font-medium px-8">
                        By continuing, you agree to ApexFind's <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                </div>
            </main>
        </div>
    )
}

function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [isResetError, setIsResetError] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setMessage('');
        setIsError(false);
        try {
            await signInWithGoogle();
            window.location.href = '/dashboard';
        } catch (error: any) {
            setIsError(true);
            setMessage(error.message);
            setIsLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        try {
            await signIn(email, password);
            window.location.href = '/dashboard';
        } catch (error: any) {
            setIsError(true);
            setIsLoading(false);
            if (error.code === 'auth/invalid-credential') {
                setMessage('Incorrect email or password. Please try again.');
            } else if (error.code === 'auth/too-many-requests') {
                setMessage('Too many failed attempts. Please try again later.');
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
        setResetMessage('Sending link...');
    
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
        <Card className="border-2 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-black">Welcome Back</CardTitle>
                <CardDescription className="text-sm font-medium">Enter your credentials to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Button variant="outline" className="w-full h-12 font-bold border-2 hover:bg-muted/50 transition-all gap-2" onClick={handleGoogleSignIn} disabled={isLoading}>
                    <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 58.2l-64.4 64.4C325.8 99.8 289.4 86 248 86c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c94.9 0 132.3-62.2 135.8-94.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                    Continue with Google
                </Button>

                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                        <span className="bg-card px-2 text-muted-foreground">
                            Or with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="signin-email" className="font-bold">Email Address</Label>
                        <Input
                            id="signin-email"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (!resetEmail) setResetEmail(e.target.value);
                            }}
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="signin-password" id="signin-password-label" className="font-bold">Password</Label>
                            <Dialog onOpenChange={() => { setResetMessage(''); setIsResetError(false); }}>
                                <DialogTrigger asChild>
                                    <Button variant="link" className="p-0 h-auto font-bold text-xs text-primary hover:text-primary/80">
                                        Forgot Password?
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black">Reset Password</DialogTitle>
                                        <DialogDescription className="font-medium pt-2">
                                            Enter your email address and we'll send you a link to reset your password.
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
                                                className="h-12"
                                            />
                                        </div>
                                         <Button type="submit" className="w-full h-12 font-black text-lg shadow-lg" disabled={isResetting}>
                                            {isResetting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                            Send Reset Link
                                         </Button>
                                        {resetMessage && <p className={cn("text-sm text-center font-bold p-3 rounded-lg", isResetError ? "text-destructive bg-destructive/10" : "text-green-700 bg-green-50")}>{resetMessage}</p>}
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="relative">
                            <Input
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full h-12 font-black text-lg shadow-lg" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Sign In to ApexFind'}
                    </Button>
                    {message && <p className={cn("text-sm text-center font-bold p-3 rounded-lg", isError ? "text-destructive bg-destructive/10" : "text-muted-foreground")}>{message}</p>}
                </form>
            </CardContent>
        </Card>
    );
}

function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'agent'>('customer');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setMessage('');
    setIsError(false);
    try {
        await signInWithGoogle();
        window.location.href = '/dashboard';
    } catch (error: any) {
        setIsError(true);
        setMessage(error.message);
        setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
        await signUp(name, email, password, role);
        setIsVerificationSent(true);
    } catch (error: any) {
        setIsError(true);
        setIsLoading(false);
        if (error.code === 'auth/email-already-in-use') {
            setMessage('An account with this email address already exists.');
        } else if (error.code === 'auth/weak-password') {
            setMessage('Password should be at least 6 characters long.');
        } else {
            setMessage(error.message);
        }
    }
  };

  if (isVerificationSent) {
    return (
        <Card className="text-center border-2 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <CardHeader className="pt-12">
                <div className="mx-auto bg-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                    <MailCheck className="text-primary h-12 w-12" />
                </div>
                <CardTitle className="text-3xl font-black">Verify Your Identity</CardTitle>
                <CardDescription className="text-lg font-medium pt-2">
                    A secure verification link was sent to: <br/>
                    <strong className="text-foreground">{email}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Please click the link in the email to activate your account. If you don't see it, check your spam folder or wait a few minutes.
                </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 px-10 pb-12">
                <Button className="w-full h-14 font-black text-lg shadow-xl" onClick={() => window.location.href = '/dashboard'}>
                    I've Verified, Continue <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="ghost" className="w-full h-12 font-bold text-muted-foreground" onClick={() => setIsVerificationSent(false)}>
                    Use a different email
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="border-2 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-black">Join the Community</CardTitle>
            <CardDescription className="text-sm font-medium">Create your free account to start your journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Button variant="outline" className="w-full h-12 font-bold border-2 hover:bg-muted/50 transition-all gap-2" onClick={handleGoogleSignUp} disabled={isLoading}>
                <svg className="h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.4 58.2l-64.4 64.4C325.8 99.8 289.4 86 248 86c-82.3 0-149.3 67-149.3 149.3s67 149.3 149.3 149.3c94.9 0 132.3-62.2 135.8-94.2H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
                Sign up with Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-3">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Select Profile Type</Label>
                    <RadioGroup defaultValue="customer" onValueChange={(value) => setRole(value as 'customer' | 'agent')} className="grid grid-cols-2 gap-4">
                        <Label
                            htmlFor="role-customer"
                            className={cn(
                                "flex flex-col items-center justify-between rounded-xl border-2 bg-card p-4 hover:bg-muted/50 cursor-pointer transition-all",
                                role === 'customer' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                            )}
                        >
                            <RadioGroupItem value="customer" id="role-customer" className="sr-only" />
                            <User className={cn("h-6 w-6 mb-2", role === 'customer' ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-xs font-black uppercase">Seeker</span>
                        </Label>
                        <Label
                            htmlFor="role-agent"
                            className={cn(
                                "flex flex-col items-center justify-between rounded-xl border-2 bg-card p-4 hover:bg-muted/50 cursor-pointer transition-all",
                                role === 'agent' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                            )}
                        >
                            <RadioGroupItem value="agent" id="role-agent" className="sr-only" />
                            <Briefcase className={cn("h-6 w-6 mb-2", role === 'agent' ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-xs font-black uppercase">Agent</span>
                        </Label>
                    </RadioGroup>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="signup-name" className="font-bold">Full Name</Label>
                        <Input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signup-email" className="font-bold">Email Address</Label>
                        <Input id="signup-email" type="email" placeholder="name@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signup-password" id="signup-password-label" className="font-bold">Password</Label>
                        <div className="relative">
                            <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 pr-10"
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 font-black text-lg shadow-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Create Secure Account'}
                </Button>
                {message && <p className={cn("text-sm text-center font-bold p-3 rounded-lg", isError ? "text-destructive bg-destructive/10" : "text-muted-foreground")}>{message}</p>}
            </form>
        </CardContent>
    </Card>
  );
}
