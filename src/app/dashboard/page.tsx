'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useCollection } from "@/firebase";
import { Loader2, Heart, User as UserIcon, History, MessageSquare, Home as HomeIcon, BarChart2, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { doc, collection, query, where, orderBy } from "firebase/firestore";

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
import { PlaceHolderAgents } from "@/lib/placeholder-agents";
import { Textarea } from "@/components/ui/textarea";
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

import { formatNaira } from "@/lib/naira-formatter";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types";
import { deleteListing } from "@/lib/listings";

const linkedAgent = PlaceHolderAgents[0];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile, loading: profileLoading } = useDoc<{phoneNumber?: string, role?: 'customer' | 'agent'}>(userDocRef);

  // Agent listings state
  const propertiesQuery = useMemo(() => {
    if (!firestore || !user || userProfile?.role !== 'agent') return null;
    return query(collection(firestore, 'properties'), where('agentId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [firestore, user, userProfile]);

  const { data: agentListings, loading: listingsLoading } = useCollection<Property>(propertiesQuery);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
    // `userProfile` might be loaded after `user`
    if (userProfile) {
      setPhoneNumber(userProfile.phoneNumber || '');
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
        await updateUserProfile(firestore, user.uid, {
            displayName: displayName,
            phoneNumber: phoneNumber
        });
        setSaveMessage('Profile updated successfully!');
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


  if (userLoading || profileLoading || listingsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl text-muted-foreground">Loading Dashboard...</h1>
      </div>
    );
  }

  if (!user) {
      // This should be covered by the loader and redirect, but as a fallback.
      return null; 
  }

  if (userProfile?.role === 'agent') {
    return (
        <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Agent Dashboard
              </h1>
              <p className="mt-1 text-muted-foreground">Welcome back, Agent {user.displayName || user.email}</p>
                <Tabs defaultValue="my-listings" className="mt-8">
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
                    <TabsContent value="messages">
                        <div className="mt-8 p-8 bg-secondary rounded-lg text-center">
                            <h2 className="text-2xl font-bold">Client Messages Coming Soon!</h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">This section will house all your conversations with potential buyers and renters.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="profile">
                         <div className="mt-8 p-8 bg-secondary rounded-lg text-center">
                            <h2 className="text-2xl font-bold">Agent Profile Management Coming Soon!</h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Soon you'll be able to edit your public agent profile, upload a professional photo, and manage your specialties.</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="performance">
                         <div className="mt-8 p-8 bg-secondary rounded-lg text-center">
                            <h2 className="text-2xl font-bold">Performance Analytics Coming Soon!</h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Track your listing views, leads, and sales performance with detailed charts and reports.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
  }

  // Default to customer dashboard
  return (
    <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {user.displayName || user.email}</p>
          <Tabs defaultValue="saved-homes" className="mt-8">
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
            <TabsContent value="agent-messages">
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <Card className="md:col-span-1 lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Conversations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <div className="p-4 border-b bg-secondary cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={linkedAgent.imageUrl} />
                                            <AvatarFallback>{linkedAgent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{linkedAgent.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">Great, I'll set that up for...</p>
                                        </div>
                                    </div>
                                     <p className="text-xs text-muted-foreground mt-1 text-right">2 hours ago</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 lg:col-span-3 flex flex-col">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                     <AvatarImage src={linkedAgent.imageUrl} />
                                     <AvatarFallback>{linkedAgent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{linkedAgent.name}</CardTitle>
                                    <CardDescription>{linkedAgent.title}, {linkedAgent.company}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 h-[500px] overflow-y-auto space-y-6">
                            <div className="flex justify-end">
                                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                                    <p>Hi Amina, I'm very interested in the property at 123 Banana Island. Could we schedule a tour for this weekend?</p>
                                    <p className="text-xs text-primary-foreground/70 mt-1 text-right">You • 3 hours ago</p>
                                </div>
                            </div>
                             <div className="flex justify-start">
                                <div className="bg-muted p-3 rounded-lg max-w-xs">
                                    <p>Of course! I'd be happy to show you the property. Does Saturday at 2 PM work for you?</p>
                                    <p className="text-xs text-muted-foreground mt-1 text-right">Amina • 3 hours ago</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                                    <p>Saturday at 2 PM is perfect. Thank you!</p>
                                     <p className="text-xs text-primary-foreground/70 mt-1 text-right">You • 2 hours ago</p>
                                </div>
                            </div>
                             <div className="flex justify-start">
                                <div className="bg-muted p-3 rounded-lg max-w-xs">
                                    <p>Great, I'll set that up and send you a calendar invitation. Looking forward to it!</p>
                                     <p className="text-xs text-muted-foreground mt-1 text-right">Amina • 2 hours ago</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t p-4">
                             <div className="flex w-full items-center gap-2">
                                <Textarea placeholder="Type your message..." className="flex-1 resize-none" rows={1} />
                                <Button size="icon">
                                    <span className="sr-only">Send</span>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
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
                                        <AvatarImage src={linkedAgent.imageUrl} alt={linkedAgent.name} />
                                        <AvatarFallback>{linkedAgent.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold">{linkedAgent.name}</p>
                                        <p className="text-sm text-muted-foreground">{linkedAgent.company}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    <p>No linked agent.</p>
                                    <Button variant="link" size="sm">Find an agent</Button>
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
