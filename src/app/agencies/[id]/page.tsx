
'use client';

import { useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Star, 
  Award, 
  Users,
  Loader2,
  Calendar,
  ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard } from '@/components/property-card';
import type { Agency, Property, Agent } from '@/types';
import { notFound } from 'next/navigation';
import React from 'react';

export default function AgencyProfilePage({ params }: { params: { id: string } }) {
    const { id } = React.use(params as any) as { id: string };
    const firestore = useFirestore();

    const agencyRef = doc(firestore, 'agencies', id);
    const { data: agency, loading: agencyLoading } = useDoc<Agency>(agencyRef);

    const agentsQuery = query(collection(firestore, 'users'), where('agencyId', '==', id));
    const { data: team, loading: teamLoading } = useCollection<Agent>(agentsQuery);

    const listingsQuery = query(collection(firestore, 'properties'), where('agencyId', '==', id));
    const { data: listings, loading: listingsLoading } = useCollection<Property>(listingsQuery);

    if (agencyLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!agency) return notFound();

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Hero Header */}
            <div className="bg-secondary/30 border-b py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <Avatar className="h-32 w-32 rounded-xl border-4 border-background shadow-lg">
                            <AvatarImage src={agency.photoURL} alt={agency.name} />
                            <AvatarFallback className="text-4xl">{agency.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="text-4xl font-bold">{agency.name}</h1>
                                {agency.verificationBadges?.map(badge => (
                                    <Badge key={badge} className="bg-primary text-primary-foreground">
                                        <ShieldCheck className="h-3 w-3 mr-1" /> {badge}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {agency.location}, Nigeria</span>
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Established {new Date().getFullYear() - agency.yearsInOperation}</span>
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {agency.rating} ({agency.reviewCount} Reviews)</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button size="lg" className="gap-2">
                                <Phone className="h-4 w-4" /> Call Firm
                            </Button>
                            <Button size="lg" variant="outline" className="gap-2">
                                <Mail className="h-4 w-4" /> Email
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-4">About {agency.name}</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {agency.about || `${agency.name} is a leading real estate firm in ${agency.location}, specializing in ${agency.specialties?.join(', ')}. With over ${agency.yearsInOperation} years of experience, we provide professional and transparent property services to thousands of clients across Nigeria.`}
                            </p>
                        </section>

                        <Tabs defaultValue="listings" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-8">
                                <TabsTrigger value="listings">Listings ({listings?.length || 0})</TabsTrigger>
                                <TabsTrigger value="team">Team ({team?.length || 0})</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="listings">
                                {listingsLoading ? (
                                    <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
                                ) : listings && listings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {listings.map(property => (
                                            <PropertyCard key={property.id} property={property} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 border-2 border-dashed rounded-xl">
                                        <p className="text-muted-foreground">No active listings found for this agency.</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="team">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {team?.map(agent => (
                                        <Card key={agent.id}>
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={agent.imageUrl} />
                                                    <AvatarFallback>{agent.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-bold">{agent.name}</p>
                                                    <p className="text-sm text-muted-foreground">{agent.title}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/agents/${agent.id}`}>Profile</Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews">
                                <div className="text-center py-20 bg-muted/20 rounded-xl">
                                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-semibold">Reviews coming soon</h3>
                                    <p className="text-muted-foreground">We're verifying reviews for this firm.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Firm Verification</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 text-green-800 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="text-sm font-semibold">Government Licensed</span>
                                    </div>
                                    <Badge variant="outline" className="border-green-200 bg-white">Verified</Badge>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">LASRERA License</p>
                                        <p className="font-mono font-bold text-sm">{agency.licenseNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Memberships</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {agency.verificationBadges?.map(badge => (
                                                <Badge key={badge} variant="secondary">{badge}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Firm Specialties</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {agency.specialties?.map(spec => (
                                        <Badge key={spec} variant="outline" className="rounded-full px-4">{spec}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6">
                                <h3 className="font-bold mb-2">Want to join this agency?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Apply to become a part of the {agency.name} team and grow your professional real estate career.
                                </p>
                                <Button className="w-full" variant="outline">Learn More</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
