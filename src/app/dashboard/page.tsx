
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedHomes from "@/components/dashboard/saved-homes";
import { Heart, Search, User as UserIcon, MoreVertical, Pencil, Trash2, History, X, Mail, Phone, Building, Link2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderAgents } from "@/lib/placeholder-agents";
import { Textarea } from "@/components/ui/textarea";

const viewedProperties = PlaceHolderProperties.slice(3, 6);
const linkedAgent = PlaceHolderAgents[0];

type Property = {
  id: number;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  imageHint: string;
  lotSize?: number;
  agent?: string;
  status?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [savedPropertiesLoading, setSavedPropertiesLoading] = useState(true);


  useEffect(() => {
    const checkSessionAndLoadData = async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            router.push('/auth');
            return;
        } 
        
        setUser(currentUser);
        setLoading(false);

        const { data: savedHomesData, error } = await supabase
          .from('saved_homes')
          .select('property_data')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading saved homes:', error);
          setSavedProperties([]);
        } else if (savedHomesData) {
          const properties = savedHomesData.map(item => item.property_data);
          setSavedProperties(properties);
        }
        setSavedPropertiesLoading(false);
    };

    checkSessionAndLoadData();
  }, [router]);

  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h1 className="text-xl text-muted-foreground">Loading Dashboard...</h1>
        </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">Welcome back, {user.user_metadata.full_name || user.email}</p>
          <Tabs defaultValue="saved-homes" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 max-w-3xl">
              <TabsTrigger value="saved-homes">
                <Heart className="mr-2 h-4 w-4" />
                Saved Homes
              </TabsTrigger>
              <TabsTrigger value="saved-searches">
                <Search className="mr-2 h-4 w-4" />
                Saved Searches
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
                <SavedHomes properties={savedProperties} loading={savedPropertiesLoading} />
            </TabsContent>
            <TabsContent value="saved-searches">
                 <div className="mt-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">You have 2 saved searches</h2>
                            <p className="text-muted-foreground">Manage your alerts and get notified about new properties.</p>
                        </div>
                        <Button>+ Create New Search</Button>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl">Downtown Condos</CardTitle>
                                    <CardDescription className="pt-2">Lagos, NG • ₦150,000,000 - ₦300,000,000 • 2+ Beds</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Switch id="alert-1" />
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <Button variant="secondary">See 3 new matches</Button>
                                <p className="text-sm text-muted-foreground">Alert Frequency: Daily</p>
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-xl">Abuja Family Homes</CardTitle>
                                    <CardDescription className="pt-2">Abuja, NG • Under ₦500,000,000 • 4+ Beds • Pool</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Switch id="alert-2" checked />
                                     <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                </div>
                            </CardHeader>
                             <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <Button variant="secondary" disabled>No new matches</Button>
                                <p className="text-sm text-muted-foreground">Alert Frequency: Weekly</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="viewed-history">
                <div className="mt-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">Recently Viewed Homes</h2>
                            <p className="text-muted-foreground">A log of properties you have recently viewed.</p>
                        </div>
                        <Button variant="outline">Clear History</Button>
                    </div>
                     <div className="space-y-4">
                        {viewedProperties.map((property, index) => (
                            <Card key={property.id} className="flex overflow-hidden">
                                <Link href={`/property/${property.id}`} className="relative w-32 h-32 sm:w-48 sm:h-auto flex-shrink-0">
                                    <Image src={property.imageUrl} alt={property.address} layout="fill" objectFit="cover" />
                                </Link>
                                <div className="p-4 flex-grow">
                                    <Link href={`/property/${property.id}`}>
                                        <p className="font-semibold hover:text-primary">{property.address}</p>
                                    </Link>
                                    <p className="text-lg font-bold text-primary">₦{property.price.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">{property.beds} beds • {property.baths} baths • {property.sqft.toLocaleString()} sqft</p>
                                </div>
                                <div className="p-4 flex flex-col justify-between items-end">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove from history</span>
                                    </Button>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                        Viewed {index + 1} day{index > 0 ? 's' : ''} ago
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {viewedProperties.length === 0 && (
                        <div className="mt-8 text-center py-24 bg-secondary rounded-lg">
                            <h2 className="text-2xl font-semibold">No Viewed History</h2>
                            <p className="text-muted-foreground mt-2">Properties you view will appear here.</p>
                        </div>
                    )}
                </div>
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
                                    <Send className="h-4 w-4" />
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
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your name, contact details, and password.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                           <div className="grid sm:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={user.user_metadata.full_name || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={user.email} />
                            </div>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" defaultValue="+234 801 234 5678" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
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
      </main>
      <Footer />
    </div>
  );
}
