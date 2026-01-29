
'use client';

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { Loader2, Heart, User as UserIcon, History, Home as HomeIcon, BarChart2, MoreHorizontal, Pencil, Trash2, Eye, Users, TrendingUp, Filter, MapPin } from "lucide-react";
import { doc, collection, query, where, orderBy, limit, deleteDoc } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getAuth } from 'firebase/auth';


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedHomes from "@/components/dashboard/saved-homes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile, uploadProfilePicture, deleteUserAccount } from "@/lib/user";
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
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { formatNaira, formatNairaShort } from "@/lib/naira-formatter";
import type { Property } from "@/types";
import { deleteListing } from "@/lib/listings";
import { Textarea } from "@/components/ui/textarea";
import SavedSearches from "@/components/dashboard/saved-searches";
import { getSafeImageUrl } from "@/lib/image-utils";
import { Progress } from "@/components/ui/progress";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import UserPreferences from "@/components/onboarding/UserPreferences";
import { signOut } from "@/lib/auth";

const viewsData = [
    { month: "Jan", views: 1200 },
    { month: "Feb", views: 1800 },
    { month: "Mar", views: 1500 },
    { month: "Apr", views: 2200 },
    { month: "May", views: 2500 },
    { month: "Jun", views: 3100 },
  ];

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const queryClient = useQueryClient();

  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [about, setAbout] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [languages, setLanguages] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Onboarding/Preferences Flow State
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showPreferencesPrompt, setShowPreferencesPrompt] = useState(false);

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile, loading: profileLoading } = useDoc<{
    phoneNumber?: string, 
    role?: 'customer' | 'agent', 
    displayName?: string, 
    photoURL?: string,
    about?: string,
    specialties?: string[],
    languages?: string[],
    preferencesCompletedAt?: string;
  }>(userDocRef);

  // Agent listings state
  const propertiesQuery = useMemo(() => {
    if (!firestore || !user || userProfile?.role !== 'agent') return null;
    
    const qPath = `users/${user.uid}/properties`;
    const constraints = {
        where: [where('agentId', '==', user.uid)],
    };

    return query(collection(firestore, 'properties'), where('agentId', '==', user.uid));
  }, [firestore, user, userProfile]);

  const { data: agentListings, loading: listingsLoading } = useCollection<Property>(propertiesQuery);
  
  // Agent analytics state
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

  // Client-side sorting
  const sortedAgentListings = useMemo(() => {
    if (!agentListings) return [];
    return [...agentListings].sort((a, b) => {
        const timeA = a.createdAt?.toDate?.().getTime() || 0;
        const timeB = b.createdAt?.toDate?.().getTime() || 0;
        return timeB - timeA;
    });
  }, [agentListings]);

  // Fetch one agent to show in customer dashboard
  const firstAgentQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'users'), where('role', '==', 'agent'), limit(1));
  }, [firestore]);

  const { data: firstAgentArr } = useCollection(firstAgentQuery);
  const linkedAgent = firstAgentArr?.[0];

    // Effect to manage showing the preferences prompt for customers
  useEffect(() => {
    // Don't run until user profile is loaded and we know their role
    if (profileLoading || !userProfile || !user || userProfile.role === 'agent') {
      return;
    }
  
    // If the modal is already open/opening, ensure the prompt is hidden.
    if (showPreferencesModal) {
      if (showPreferencesPrompt) setShowPreferencesPrompt(false);
      return;
    }
  
    // If preferences are already completed in the database, we're done.
    if (userProfile.preferencesCompletedAt) {
      if (showPreferencesPrompt) setShowPreferencesPrompt(false);
      return;
    }
  
    // Check localStorage flags
    const onboardingDone = localStorage.getItem(`apexfind_onboarding_${user.uid}`) === 'true';
    const preferencesSkippedOrDone = localStorage.getItem(`apexfind_preferences_${user.uid}`) === 'true';
  
    // If initial tour is done, but preferences are not, show the prompt.
    if (onboardingDone && !preferencesSkippedOrDone) {
      setShowPreferencesPrompt(true);
    } else {
      // Otherwise, ensure it's hidden
      if (showPreferencesPrompt) setShowPreferencesPrompt(false);
    }
  }, [profileLoading, userProfile, user, showPreferencesModal]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
    // `userProfile` might be loaded after `user`
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setPhotoURL(userProfile.photoURL || user?.photoURL || '');
      setAbout(userProfile.about || '');
      setSpecialties(userProfile.specialties?.join(', ') || '');
      setLanguages(userProfile.languages?.join(', ') || '');
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth');
    }
  }, [user, userLoading, router]);

  const handleDeleteAccount = async () => {
    if (!user || !firestore) return;
    setIsDeleting(true);
    try {
        await deleteUserAccount(firestore, user.uid, userProfile?.role);
        await signOut();
        router.push('/');
        router.refresh();
    } catch (error: any) {
        console.error("Failed to delete account:", error);
        if (error.code === 'auth/requires-recent-login') {
            alert("For your security, please sign out and sign back in before deleting your account.");
        } else {
            alert(`An error occurred: ${error.message}`);
        }
        setIsDeleting(false);
    }
};

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadProgress(0);
    setIsSaving(true);
    setSaveMessage('Uploading...');
    try {
      const downloadURL = await uploadProfilePicture(file, user.uid, (progress) => {
        setUploadProgress(progress);
      });
      setPhotoURL(downloadURL);
      setUploadProgress(100);
      setSaveMessage('Upload complete! Save profile to apply changes.');
      setTimeout(() => {
          setUploadProgress(null);
      }, 5000);
    } catch (error: any) {
        setSaveMessage(`Upload failed: ${error.message}`);
        setUploadProgress(null);
    } finally {
        setIsSaving(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    setIsSaving(true);
    setSaveMessage('');
    try {
        const profileData: any = {
            displayName,
            phoneNumber,
            photoURL
        };
        if (userProfile?.role === 'agent') {
            profileData.about = about;
            profileData.specialties = specialties.split(',').map(s => s.trim()).filter(Boolean);
            profileData.languages = languages.split(',').map(s => s.trim()).filter(Boolean);
        }
        await updateUserProfile(firestore, user.uid, profileData);
        setSaveMessage('Profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
        setSaveMessage(`Error: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!firestore || !user) return;
    try {
      await deleteListing(firestore, id);
      await queryClient.invalidateQueries({ queryKey: ['firestore-collection', `users/${user.uid}/properties`] });
    } catch (error) {
      console.error("Failed to delete listing", error);
      // In a real app, you'd show a toast notification here
    }
  }


  if (userLoading || profileLoading || (userProfile?.role === 'agent' && listingsLoading)) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl text-muted-foreground">Loading Dashboard...</h1>
      </div>
    );
  }

  if (!user) {
      // This should be covered by the loader and redirect, but as a fallback.
      return null; 
  }

  const initialTab = searchParams.get('tab') || (userProfile?.role === 'agent' ? 'my-listings' : 'saved-homes');

  if (userProfile?.role === 'agent') {
    return (
        <>
            <OnboardingFlow userId={user.uid} role={userProfile.role} />
            <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
                <div className="mx-auto w-full max-w-7xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Agent Dashboard
                  </h1>
                  <p className="mt-1 text-muted-foreground">Welcome back, Agent {user.displayName || user.email}</p>
                    <Tabs defaultValue={initialTab} className="mt-8 flex flex-col flex-grow">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 max-w-2xl">
                            <TabsTrigger value="my-listings"><HomeIcon className="mr-2 h-4 w-4"/> My Listings</TabsTrigger>
                            <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4"/> Profile</TabsTrigger>
                            <TabsTrigger value="performance"><BarChart2 className="mr-2 h-4 w-4"/> Performance</TabsTrigger>
                        </TabsList>
                        <TabsContent value="my-listings">
                            <Card className="mt-8">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <CardTitle>My Property Listings</CardTitle>
                                            <CardDescription>You have {sortedAgentListings?.length || 0} active listings.</CardDescription>
                                        </div>
                                        <Button asChild>
                                            <Link href="/dashboard/listings/new">+ Add New Listing</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="hidden sm:table-cell">Image</TableHead>
                                                <TableHead>Property</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sortedAgentListings?.map(property => (
                                                <TableRow key={property.id}>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <Image src={getSafeImageUrl(property.imageUrl, property.home_type)} alt={property.address || 'Property image'} width={100} height={60} className="rounded-md object-cover" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{property.address}</div>
                                                        <div className="text-sm text-muted-foreground">{property.beds} beds • {property.baths} baths</div>
                                                    </TableCell>
                                                    <TableCell>{formatNaira(property.price)}</TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge variant={property.status === 'New' ? 'default' : 'secondary'}>{property.status || 'Active'}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                      <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                          </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/dashboard/listings/${property.id}/edit`} className="w-full">
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Listing
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/property/${property.id}`} className="flex items-center w-full">
                                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                             <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the listing for "{property.address}".
                                                                    </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteListing(property.id)}>Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                      </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {(!sortedAgentListings || sortedAgentListings.length === 0) && (
                                      <div className="text-center p-8">
                                        <h3 className="text-xl font-semibold">No listings yet.</h3>
                                        <p className="text-muted-foreground mt-2">Get started by adding your first property.</p>
                                        <Button asChild className="mt-4">
                                           <Link href="/dashboard/listings/new">+ Add New Listing</Link>
                                        </Button>
                                      </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="profile">
                            <Card className="mt-8">
                                <form onSubmit={handleProfileSave}>
                                    <CardHeader>
                                        <CardTitle>Agent Profile</CardTitle>
                                        <CardDescription>This information will be displayed on your public agent page.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-6">
                                        {profileLoading ? (
                                            <Skeleton className="h-64 w-full" />
                                        ) : (
                                            <>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Full Name</Label>
                                                        <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input id="email" type="email" value={user.email || ''} readOnly disabled />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +234 801 234 5678"/>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Profile Picture</Label>
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-20 w-20">
                                                            <AvatarImage src={photoURL} alt={displayName} />
                                                            <AvatarFallback>{displayName?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-grow">
                                                            <Input 
                                                                id="photo-upload" 
                                                                type="file" 
                                                                onChange={handleProfileImageUpload} 
                                                                accept="image/*" 
                                                                disabled={uploadProgress !== null}
                                                            />
                                                            {uploadProgress !== null && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Progress value={uploadProgress} className="w-full" />
                                                                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                                                            </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="about">About Me</Label>
                                                    <Textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell clients a little about yourself, your experience, and your approach." />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="specialties">Specialties</Label>
                                                    <Input id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="Luxury Homes, First-time Buyers, Commercial (comma-separated)" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="languages">Languages</Label>
                                                    <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Yoruba, Igbo (comma-separated)" />
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex-col items-start gap-2">
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? (uploadProgress !== null ? "Uploading..." : "Saving...") : "Save Changes"}
                                        </Button>
                                        {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
                                    </CardFooter>
                                </form>
                            </Card>
                            <Card className="mt-8 bg-destructive/10 border-destructive/20">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                    <CardDescription className="text-destructive/80">
                                        Permanently delete your account and all associated data, including your public agent profile and listings. This action cannot be undone.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">Delete My Account</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete your account, your public profile, and all of your property listings. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                                                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="performance">
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
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    )
  }

  // Default to customer dashboard
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
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-3xl">
                  <TabsTrigger value="saved-homes">
                    <Heart className="mr-2 h-4 w-4" />
                    Saved Homes
                  </TabsTrigger>
                  <TabsTrigger value="saved-searches">
                    <Filter className="mr-2 h-4 w-4" />
                    Saved Searches
                  </TabsTrigger>
                  <TabsTrigger value="viewed-history">
                    <History className="mr-2 h-4 w-4" />
                    Viewed History
                  </TabsTrigger>
                  <TabsTrigger value="profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
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
                 <TabsContent value="profile">
                     <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <form onSubmit={handleProfileSave}>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your name and contact details.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    {profileLoading ? (
                                        <>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-10 w-full" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-10 w-full" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input id="email" type="email" value={user.email || ''} readOnly disabled />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +234 801 234 5678"/>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-2">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                    {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
                                </CardFooter>
                            </form>
                        </Card>
    
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Agent</CardTitle>
                                 <CardDescription>Your primary contact for your home search.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {linkedAgent ? (
                                    <div className="flex items-center gap-4">
                                         <Avatar className="h-16 w-16">
                                            <AvatarImage src={linkedAgent.photoURL ?? undefined} alt={linkedAgent.displayName ?? "Agent"} />
                                            <AvatarFallback>{linkedAgent.displayName?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold">{linkedAgent.displayName}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-4">
                                        <p>No linked agent.</p>
                                        <Button variant="link" size="sm" asChild>
                                            <Link href="/agents">Find an agent</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                             <CardFooter>
                                <Button variant="outline" className="w-full">Change Agent</Button>
                            </CardFooter>
                        </Card>
    
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Communication Preferences</CardTitle>
                                <CardDescription>Manage how we get in touch with you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <Label htmlFor="sms-notifications" className="font-medium">SMS Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Receive important updates via text message.</p>
                                    </div>
                                    <Switch id="sms-notifications" />
                                </div>
                                <div className="space-y-2 rounded-lg border p-4">
                                     <p className="font-medium">Email Notifications</p>
                                     <div className="space-y-2 pl-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="email-saved-searches" defaultChecked />
                                            <Label htmlFor="email-saved-searches" className="font-normal">Saved Search Alerts</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="email-market-news" defaultChecked />
                                            <Label htmlFor="email-market-news" className="font-normal">Market News & Insights</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="email-partner-offers" />
                                            <Label htmlFor="email-partner-offers" className="font-normal">Relevant Partner Offers</Label>
                                        </div>
                                     </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Update Preferences</Button>
                            </CardFooter>
                        </Card>

                        <Card className="lg:col-span-3 bg-destructive/10 border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription className="text-destructive/80">
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete My Account</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete your account, saved homes, saved searches, and all other personal data. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                                                {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
    
                    </div>
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
