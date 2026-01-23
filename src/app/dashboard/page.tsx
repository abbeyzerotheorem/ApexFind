
'use client';

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { Loader2, Heart, User as UserIcon, History, MessageSquare, Home as HomeIcon, BarChart2, MoreHorizontal, Pencil, Trash2, Eye, Users, TrendingUp } from "lucide-react";
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


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
import { updateUserProfile } from "@/lib/user";
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
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";
import { deleteListing } from "@/lib/listings";
import ChatInterface from "@/components/dashboard/chat-interface";
import { Textarea } from "@/components/ui/textarea";

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

  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [about, setAbout] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [languages, setLanguages] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
  }>(userDocRef);

  // Agent listings state
  const propertiesQuery = useMemo(() => {
    if (!firestore || !user || userProfile?.role !== 'agent') return null;
    return query(collection(firestore, 'properties'), where('agentId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [firestore, user, userProfile]);

  const { data: agentListings, loading: listingsLoading } = useCollection<Property>(propertiesQuery);

  // Fetch one agent to show in customer dashboard
  const firstAgentQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'users'), where('role', '==', 'agent'), limit(1));
  }, [firestore]);

  const { data: firstAgentArr } = useCollection(firstAgentQuery);
  const linkedAgent = firstAgentArr?.[0];

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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    setIsSaving(true);
    setSaveMessage('');
    try {
        const profileData: any = {
            displayName,
            phoneNumber
        };
        if (userProfile?.role === 'agent') {
            profileData.photoURL = photoURL;
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
    if (!firestore) return;
    try {
      await deleteListing(firestore, id);
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
        <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
            <div className="mx-auto w-full max-w-7xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Agent Dashboard
              </h1>
              <p className="mt-1 text-muted-foreground">Welcome back, Agent {user.displayName || user.email}</p>
                <Tabs defaultValue={initialTab} className="mt-8 flex flex-col flex-grow">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
                        <TabsTrigger value="my-listings"><HomeIcon className="mr-2 h-4 w-4"/> My Listings</TabsTrigger>
                        <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4"/> Messages</TabsTrigger>
                        <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4"/> Profile</TabsTrigger>
                        <TabsTrigger value="performance"><BarChart2 className="mr-2 h-4 w-4"/> Performance</TabsTrigger>
                    </TabsList>
                    <TabsContent value="my-listings">
                        <Card className="mt-8">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <CardTitle>My Property Listings</CardTitle>
                                        <CardDescription>You have {agentListings?.length || 0} active listings.</CardDescription>
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
                                        {agentListings?.map(property => (
                                            <TableRow key={property.id}>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Image src={property.imageUrl} alt={property.address} width={100} height={60} className="rounded-md object-cover" />
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
                                {(!agentListings || agentListings.length === 0) && (
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
                    <TabsContent value="messages" className="flex-grow">
                        <ChatInterface />
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
                                                <Label htmlFor="photoURL">Profile Picture URL</Label>
                                                <Input id="photoURL" type="url" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} placeholder="https://example.com/your-image.jpg"/>
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
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                    {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                    <TabsContent value="performance">
                        <div className="mt-8 space-y-8">
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">12,834</div>
                                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">152</div>
                                        <p className="text-xs text-muted-foreground">+18.3% from last month</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">1.2%</div>
                                        <p className="text-xs text-muted-foreground">+0.2% from last month</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="lg:col-span-4">
                                    <CardHeader>
                                        <CardTitle>Listing Views</CardTitle>
                                        <CardDescription>Total views across all your listings in the last 6 months.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <ResponsiveContainer width="100%" height={350}>
                                            <LineChart data={viewsData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle>Top Listings</CardTitle>
                                        <CardDescription>Your most viewed properties.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Property</TableHead>
                                                    <TableHead className="text-right">Views</TableHead>
                                                    <TableHead className="text-right">Leads</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {agentListings?.slice(0, 5).map((listing, index) => (
                                                    <TableRow key={listing.id}>
                                                        <TableCell>
                                                            <div className="font-medium truncate max-w-40">{listing.address}</div>
                                                            <div className="text-xs text-muted-foreground">{listing.city}</div>
                                                        </TableCell>
                                                        <TableCell className="text-right">{(4382 - index * 621).toLocaleString()}</TableCell>
                                                        <TableCell className="text-right">{Math.round(65 - index * 9.5)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
  }

  // Default to customer dashboard
  return (
    <div className="flex flex-col flex-grow bg-background py-8 sm:py-12">
        <div className="mx-auto w-full max-w-7xl flex flex-col flex-grow px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {user.displayName || user.email}</p>
          <Tabs defaultValue={initialTab} className="mt-8 flex flex-col flex-grow">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl">
              <TabsTrigger value="saved-homes">
                <Heart className="mr-2 h-4 w-4" />
                Saved Homes
              </TabsTrigger>
              <TabsTrigger value="viewed-history">
                <History className="mr-2 h-4 w-4" />
                Viewed History
              </TabsTrigger>
              <TabsTrigger value="agent-messages">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="profile">
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>
            <TabsContent value="saved-homes">
                <SavedHomes />
            </TabsContent>
            <TabsContent value="viewed-history">
                <ViewedHistory />
            </TabsContent>
            <TabsContent value="agent-messages" className="flex-grow">
                <ChatInterface />
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
                                        <AvatarImage src={linkedAgent.photoURL ?? undefined} alt={linkedAgent.displayName ?? ""} />
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

                </div>
            </TabsContent>
          </Tabs>
        </div>
    </div>
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
