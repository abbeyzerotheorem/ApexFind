
'use client';

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useFirestore, useDoc, useAuth } from "@/firebase";
import { Loader2, Heart, Users, TrendingUp, Filter, MapPin, Eye, MailWarning, BarChart3, ArrowUpRight } from "lucide-react";
import { doc, collection, query, where, limit } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedHomes from "@/components/dashboard/saved-homes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import ViewedHistory from "@/components/dashboard/viewed-history";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SavedSearches from "@/components/dashboard/saved-searches";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import UserPreferences from "@/components/onboarding/UserPreferences";
import { resendVerificationEmail } from "@/lib/auth";

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showPreferencesPrompt, setShowPreferencesPrompt] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile, loading: profileLoading } = useDoc<{
    role?: 'customer' | 'agent', 
    preferencesCompletedAt?: string;
    displayName?: string;
  }>(userDocRef);

  const { data: analyticsStats, isLoading: analyticsLoading } = useQuery({
      queryKey: ['analytics-stats', user?.uid],
      queryFn: async () => {
          if (!user) return null;
          const token = await user.getIdToken();
          const response = await fetch('/api/analytics/stats', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to fetch analytics');
          }
          return response.json();
      },
      enabled: !!user && userProfile?.role === 'agent',
  });

  useEffect(() => {
    if (profileLoading || !userProfile || !user || userProfile.role === 'agent') {
      return;
    }
  
    if (showPreferencesModal) {
      if (showPreferencesPrompt) setShowPreferencesPrompt(false);
      return;
    }
  
    if (userProfile.preferencesCompletedAt) {
      if (showPreferencesPrompt) setShowPreferencesPrompt(false);
      return;
    }
  
    const onboardingDone = localStorage.getItem(`apexfind_onboarding_${user.uid}`) === 'true';
    const preferencesSkippedOrDone = localStorage.getItem(`apexfind_preferences_${user.uid}`) === 'true';
  
    if (onboardingDone && !preferencesSkippedOrDone) {
      setShowPreferencesPrompt(true);
    } else {
      if (showPreferencesPrompt) setShowPreferencesPrompt(false);
    }
  }, [profileLoading, userProfile, user, showPreferencesModal]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth');
    }
  }, [user, userLoading, router]);

  const handleReloadStatus = async () => {
    if (auth.currentUser) {
        await auth.currentUser.reload();
        window.location.reload();
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendStatus('idle');
    try {
        await resendVerificationEmail();
        setResendStatus('sent');
    } catch (error) {
        console.error("Resend error:", error);
        setResendStatus('error');
    } finally {
        setIsResending(false);
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h1 className="text-xl font-medium text-muted-foreground">Initializing dashboard...</h1>
      </div>
    );
  }

  if (!user) {
      return null; 
  }

  if (!user.emailVerified) {
    return (
        <div className="flex flex-col flex-grow items-center justify-center bg-background px-4 py-12">
            <Card className="max-w-md w-full text-center shadow-xl border-2">
                <CardHeader>
                    <div className="mx-auto bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-yellow-100">
                        <MailWarning className="text-yellow-600 h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Email Verification Required</CardTitle>
                    <CardDescription className="text-base pt-2">
                        To maintain a high-quality community, please verify your email address to access the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>A verification link was sent to:</p>
                    <p className="font-bold text-foreground bg-muted p-2 rounded-md">{user.email}</p>
                    <p>Check your inbox and spam folder. The link is valid for 24 hours.</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4 border-t">
                    <Button className="w-full h-12 font-bold" onClick={handleReloadStatus}>
                        I've Verified, Refresh Status
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full h-12" 
                        onClick={handleResendVerification}
                        disabled={isResending}
                    >
                        {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {resendStatus === 'sent' ? 'New Link Sent!' : 'Resend Verification Email'}
                    </Button>
                    {resendStatus === 'error' && (
                        <p className="text-xs text-destructive">Too many requests. Please wait a few minutes before trying again.</p>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
  }

  const initialTab = searchParams.get('tab') || 'saved-homes';

  if (userProfile?.role === 'agent') {
    return (
        <>
            <OnboardingFlow userId={user.uid} role={userProfile.role} />
            <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
                <div className="mx-auto w-full max-w-7xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Agent Dashboard
                        </h1>
                        <p className="mt-1 text-muted-foreground">Monitor platform trends and your market reach.</p>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href="/dashboard/profile">
                            Update Profile <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                  </div>
                    
                    <div className="mt-8 space-y-8">
                        {analyticsLoading ? <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : (
                        <>
                            <div className="grid gap-6 md:grid-cols-2">
                            <Card className="shadow-sm border-l-4 border-l-primary">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total platform searches</CardTitle>
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black">{analyticsStats?.processedEvents?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Real-time user intent tracking enabled</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-l-4 border-l-accent">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active locations tracked</CardTitle>
                                    <MapPin className="h-5 w-5 text-accent" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black">{analyticsStats?.topLocations?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Trending neighborhoods across Nigeria</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="lg:col-span-4 shadow-sm">
                                <CardHeader className="border-b bg-muted/5">
                                    <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Top Searched Areas</CardTitle>
                                    <CardDescription>
                                        The most popular neighborhoods users are currently exploring.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {analyticsStats?.topLocations?.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/5">
                                                    <TableHead className="pl-6">Location</TableHead>
                                                    <TableHead className="text-right pr-6">Search Volume</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {analyticsStats.topLocations.map((loc: {location: string, count: number}, index: number) => (
                                                    <TableRow key={loc.location} className="hover:bg-muted/10 transition-colors">
                                                        <TableCell className="font-bold capitalize pl-6 flex items-center gap-3">
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">{index + 1}</span>
                                                            {loc.location}
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6 font-mono text-sm">{loc.count.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-20 text-muted-foreground">
                                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            <p className="font-medium">No trending data yet.</p>
                                            <p className="text-sm mt-1">As users search for properties, insights will appear here.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="lg:col-span-3 shadow-sm flex flex-col">
                                <CardHeader className="border-b bg-muted/5">
                                    <CardTitle className="text-lg">AI Market Pulse</CardTitle>
                                    <CardDescription>Real-time insights based on platform activity.</CardDescription>
                                </CardHeader>
                                <CardContent className="py-6 flex-grow">
                                    {analyticsStats?.marketInsights?.length > 0 ? (
                                        <ul className="space-y-4">
                                            {analyticsStats.marketInsights.map((insight: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                                                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                                                    <span className="leading-tight">{insight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                                            <Eye className="h-10 w-10 opacity-20 mb-4" />
                                            <p className="text-sm px-6">We're gathering more search data to generate precise AI market insights.</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-muted/5 border-t py-4 justify-center">
                                    <Button variant="link" size="sm" asChild>
                                        <Link href="/insights">Detailed Market Reports →</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                        </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
  }

  // Customer Dashboard
  return (
    <>
        {userProfile && (
            <>
                <OnboardingFlow 
                    userId={user.uid} 
                    role={userProfile.role} 
                    onComplete={() => {
                        if (userProfile.role === 'customer') {
                            setShowPreferencesModal(true)
                        }
                    }} 
                />
                {showPreferencesModal && (
                    <UserPreferences 
                        userId={user.uid} 
                        onComplete={() => {
                            setShowPreferencesModal(false);
                            setShowPreferencesPrompt(false);
                        }} 
                    />
                )}
            </>
        )}
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-7xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                My Dashboard
              </h1>
              <p className="mt-1 text-muted-foreground">Welcome back, {userProfile?.displayName || user.email}</p>
              
              {showPreferencesPrompt && (
                  <Card className="my-6 bg-primary/10 border-primary/20 shadow-sm">
                      <CardHeader className="flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">Personalize Your Search</CardTitle>
                            <CardDescription>Tell us your preferences to get better home recommendations.</CardDescription>
                        </div>
                        <Button onClick={() => setShowPreferencesModal(true)} className="font-bold">Customize My Profile</Button>
                      </CardHeader>
                  </Card>
              )}

              <Tabs defaultValue={initialTab} className="mt-8 flex flex-col flex-grow">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 max-w-xl bg-muted/50 p-1">
                  <TabsTrigger value="saved-homes" className="data-[state=active]:shadow-sm">
                    <Heart className="mr-2 h-4 w-4" />
                    Saved
                  </TabsTrigger>
                  <TabsTrigger value="saved-searches" className="data-[state=active]:shadow-sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Alerts
                  </TabsTrigger>
                  <TabsTrigger value="viewed-history" className="data-[state=active]:shadow-sm">
                    <Eye className="mr-2 h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="saved-homes">
                    <SavedHomes />
                </TabsContent>
                <TabsContent value="saved-searches">
                    <SavedSearches />
                </TabsContent>
                <TabsContent value="viewed-history">
                    <ViewedHistory />
                </TabsContent>
              </Tabs>
            </div>
        </div>
    </>
  );
}


export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-grow items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
