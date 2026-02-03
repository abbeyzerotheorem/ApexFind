'use client';

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useFirestore, useDoc, useAuth } from "@/firebase";
import { Loader2, Heart, Users, TrendingUp, Filter, MapPin, Eye, MailWarning } from "lucide-react";
import { doc, collection, query, where, limit } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedHomes from "@/components/dashboard/saved-homes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        // Since useUser uses onAuthStateChanged, it might not trigger a state update 
        // immediately after reload. A hard refresh is the most reliable way to update emailVerified.
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl text-muted-foreground">Loading Dashboard...</h1>
      </div>
    );
  }

  if (!user) {
      return null; 
  }

  // --- Email Verification Check ---
  if (!user.emailVerified) {
    return (
        <div className="flex flex-col flex-grow items-center justify-center bg-background px-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <MailWarning className="text-yellow-600 h-8 w-8" />
                    </div>
                    <CardTitle>Verify Your Email</CardTitle>
                    <CardDescription>
                        To protect our community and your account, we require all users to verify their email address.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>We've sent a verification link to <strong>{user.email}</strong>.</p>
                    <p>If you don't see it, check your spam folder.</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button className="w-full" onClick={handleReloadStatus}>
                        Check Verification Status
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleResendVerification}
                        disabled={isResending}
                    >
                        {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {resendStatus === 'sent' ? 'Verification Sent!' : 'Resend Verification Email'}
                    </Button>
                    {resendStatus === 'error' && (
                        <p className="text-xs text-destructive">Too many requests. Please try again later.</p>
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
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Agent Dashboard
                  </h1>
                  <p className="mt-1 text-muted-foreground">Performance & Market Insights</p>
                    
                    <div className="mt-8 space-y-8">
                        {analyticsLoading ? <Skeleton className="h-96 w-full" /> : (
                        <>
                            <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Searches Tracked</CardTitle>
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analyticsStats?.processedEvents || 0}</div>
                                    <p className="text-xs text-muted-foreground">Across the entire platform</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Unique Locations Searched</CardTitle>
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{analyticsStats?.topLocations?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">In the top 100 events</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="lg:col-span-4">
                                <CardHeader>
                                    <CardTitle>Top Searched Locations</CardTitle>
                                    <CardDescription>
                                        {analyticsStats?.topLocations?.length > 0 ? 'The most popular locations users are searching for.' : 'No search data available yet.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {analyticsStats?.topLocations?.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Location</TableHead>
                                                    <TableHead className="text-right">Search Count</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {analyticsStats.topLocations.map((loc: {location: string, count: number}) => (
                                                    <TableRow key={loc.location}>
                                                        <TableCell className="font-medium capitalize">{loc.location}</TableCell>
                                                        <TableCell className="text-right">{loc.count}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center text-muted-foreground p-8">
                                            <p>Start tracking 'search_performed' events to see data here.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <CardTitle>Market Insights</CardTitle>
                                    <CardDescription>AI-generated summary of market trends.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {analyticsStats?.marketInsights?.length > 0 ? (
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            {analyticsStats.marketInsights.map((insight: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <TrendingUp className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                                                    <span>{insight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                            <div className="text-center text-muted-foreground p-8">
                                            <p>No insights to display.</p>
                                        </div>
                                    )}
                                </CardContent>
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
              <p className="mt-1 text-muted-foreground">Welcome back, {user.displayName || user.email}</p>
              
              {showPreferencesPrompt && (
                  <Card className="my-6 bg-primary/10 border-primary/20">
                      <CardHeader className="flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Personalize Your Experience</CardTitle>
                            <CardDescription>Tell us what you're looking for to get better recommendations.</CardDescription>
                        </div>
                        <Button onClick={() => setShowPreferencesModal(true)}>Set Preferences</Button>
                      </CardHeader>
                  </Card>
              )}

              <Tabs defaultValue={initialTab} className="mt-8 flex flex-col flex-grow">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 max-w-xl">
                  <TabsTrigger value="saved-homes">
                    <Heart className="mr-2 h-4 w-4" />
                    Saved Homes
                  </TabsTrigger>
                  <TabsTrigger value="saved-searches">
                    <Filter className="mr-2 h-4 w-4" />
                    Saved Searches
                  </TabsTrigger>
                  <TabsTrigger value="viewed-history">
                    <Eye className="mr-2 h-4 w-4" />
                    Viewed History
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
      <div className="flex flex-col flex-grow items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl text-muted-foreground">Loading Dashboard...</h1>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
