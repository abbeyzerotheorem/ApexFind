
'use client';

import { notFound } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, Mail, Phone, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyCard } from '@/components/property-card';
import type { Property } from '@/types';
import { useState } from 'react';
import { getOrCreateConversation } from '@/lib/chat';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AgentProfileUser = {
    id: string;
    displayName?: string;
    photoURL?: string;
    email?: string;
    phoneNumber?: string;
    about?: string;
    specialties?: string[];
    languages?: string[];
    experience?: number;
    sales?: number;
    rating?: number;
    reviewCount?: number;
};

export default function AgentProfilePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const firestore = useFirestore();
    const router = useRouter();
    const { user } = useUser();
    const [isContacting, setIsContacting] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    const agentRef = doc(firestore, 'users', id);

    const { data: agent, loading: agentLoading } = useDoc<AgentProfileUser>(agentRef);

    const propertiesQuery = query(
        collection(firestore, 'properties'), 
        where('agentId', '==', id),
        orderBy('createdAt', 'desc')
    );

    const { data: properties, loading: propertiesLoading } = useCollection<Property>(propertiesQuery);
    
    const handleContactAgent = async () => {
        if (!user || !firestore) {
            setShowAuthDialog(true);
            return;
        }
        if (!agent) return;

        setIsContacting(true);
        try {
            const conversationId = await getOrCreateConversation(
                firestore,
                { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL },
                { uid: agent.id, displayName: agent.displayName || null, photoURL: agent.photoURL || null }
            );
            router.push(`/messages?convoId=${conversationId}`);
        } catch (error) {
            console.error("Failed to create conversation", error);
            // In a real app, show a toast notification
        } finally {
            setIsContacting(false);
        }
    }


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
    
    const aboutText = agent.about || `A seasoned professional with ${agent.experience || 0} years of experience in the Nigerian real estate market, ${agent.displayName} is dedicated to helping clients find their perfect home. Specializing in ${(agent.specialties || []).join(', ')}, they bring a wealth of knowledge and a commitment to client satisfaction.`;


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
                                    <span className="font-bold">{(agent.rating || 0).toFixed(1)}</span>
                                    <span className="text-muted-foreground">({agent.reviewCount || 0} reviews)</span>
                                </div>
                                
                                <div className="mt-6 flex flex-col gap-3">
                                    <Button size="lg" onClick={handleContactAgent} disabled={isContacting}>
                                        {isContacting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Phone className="mr-2 h-4 w-4"/>}
                                        {isContacting ? 'Contacting...' : 'Contact Agent'}
                                    </Button>
                                    <Button size="lg" variant="outline">
                                        <Mail className="mr-2 h-4 w-4"/> {agent.email}
                                    </Button>
                                </div>
                            </CardContent>
                             <div className="grid grid-cols-2 border-t text-center">
                                <div className="p-4 border-r">
                                    <p className="text-2xl font-bold">{agent.experience || 0} yrs</p>
                                    <p className="text-sm text-muted-foreground">Experience</p>
                                </div>
                                <div className="p-4">
                                    <p className="text-2xl font-bold">{agent.sales || 0}</p>
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
                                {aboutText}
                            </p>
                             <div className="mt-4">
                                <p><span className="font-semibold">Languages:</span> {(agent.languages || []).join(', ')}</p>
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
            <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create an Account to Continue</AlertDialogTitle>
                  <AlertDialogDescription>
                    To save properties, schedule tours, and contact agents, you need to have an account. It's free and only takes a minute!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push('/auth')}>Sign Up / Sign In</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
