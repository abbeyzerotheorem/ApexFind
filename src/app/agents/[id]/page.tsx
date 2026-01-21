'use client';

import { notFound } from 'next/navigation';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, Mail, Phone, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyCard } from '@/components/property-card';
import type { Property } from '@/types';
import { useMemo } from 'react';

type AgentProfileUser = {
    id: string;
    displayName?: string;
    photoURL?: string;
    email?: string;
    phoneNumber?: string;
};


export default function AgentProfilePage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();
    const { id } = params;

    const agentRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'users', id);
    }, [firestore, id]);

    const { data: agent, loading: agentLoading } = useDoc<AgentProfileUser>(agentRef);

    const propertiesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'properties'), 
            where('agentId', '==', id),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, id]);

    const { data: properties, loading: propertiesLoading } = useCollection<Property>(propertiesQuery);

    if (agentLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h1 className="text-xl text-muted-foreground">Loading Agent Profile...</h1>
            </div>
        );
    }

    if (!agent) {
        notFound();
    }
    
    // Placeholder data
    const agentStats = {
        experience: 5,
        sales: 32,
        rating: 4.8,
        reviewCount: 55,
        specialties: ['Luxury Homes', 'First-time Buyers', 'Rentals'],
        languages: ['English', 'Yoruba'],
    };

    return (
        <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Agent Profile Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                             <CardContent className="p-6 text-center">
                                <Avatar className="h-28 w-28 mx-auto mb-4 border-4 border-primary">
                                    <AvatarImage src={agent.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${agent.displayName || 'A'}`} alt={agent.displayName || 'Agent'} />
                                    <AvatarFallback>{agent.displayName?.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <h1 className="text-2xl font-bold">{agent.displayName}</h1>
                                <p className="text-muted-foreground">Real Estate Agent at ApexFind</p>
                                <div className="mt-2 flex items-center justify-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="font-bold">{agentStats.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">({agentStats.reviewCount} reviews)</span>
                                </div>
                                
                                <div className="mt-6 flex flex-col gap-3">
                                    <Button size="lg">
                                        <Phone className="mr-2 h-4 w-4"/> Contact Agent
                                    </Button>
                                    <Button size="lg" variant="outline">
                                        <Mail className="mr-2 h-4 w-4"/> {agent.email}
                                    </Button>
                                </div>
                            </CardContent>
                             <div className="grid grid-cols-2 border-t text-center">
                                <div className="p-4 border-r">
                                    <p className="text-2xl font-bold">{agentStats.experience} yrs</p>
                                    <p className="text-sm text-muted-foreground">Experience</p>
                                </div>
                                <div className="p-4">
                                    <p className="text-2xl font-bold">{agentStats.sales}</p>
                                    <p className="text-sm text-muted-foreground">Sales (24 mo)</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Agent Listings & Details */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold">About {agent.displayName}</h2>
                            <p className="mt-4 text-muted-foreground">
                                A seasoned professional with {agentStats.experience} years of experience in the Nigerian real estate market, {agent.displayName} is dedicated to helping clients find their perfect home. Specializing in {agentStats.specialties.join(', ')}, they bring a wealth of knowledge and a commitment to client satisfaction.
                            </p>
                             <div className="mt-4">
                                <p><span className="font-semibold">Languages:</span> {agentStats.languages.join(', ')}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold">Agent's Listings ({properties?.length || 0})</h2>
                             <div className="mt-6">
                                {propertiesLoading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
                                ) : (
                                     properties && properties.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {properties.map(prop => (
                                                <PropertyCard key={prop.id} property={prop} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-secondary rounded-lg">
                                            <h3 className="text-xl font-semibold">No Active Listings</h3>
                                            <p className="text-muted-foreground mt-2">This agent currently has no properties listed.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div>
                             <h2 className="text-3xl font-bold">Client Reviews</h2>
                              <div className="mt-6 text-center py-12 bg-secondary rounded-lg">
                                    <h3 className="text-xl font-semibold">Reviews Coming Soon</h3>
                                    <p className="text-muted-foreground mt-2">Check back later to see what clients are saying.</p>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
