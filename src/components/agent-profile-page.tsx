
'use client';

import { notFound } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Loader2, Mail, Phone, Star, ShieldCheck, Award, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '@/components/property-card';
import type { Property, Agent } from '@/types';
import { useState, useMemo } from 'react';
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

export default function AgentProfilePage({ id }: { id: string }) {
    const firestore = useFirestore();
    const router = useRouter();
    const { user } = useUser();
    const [isContacting, setIsContacting] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    const agentRef = doc(firestore, 'users', id);
    const { data: agent, loading: agentLoading } = useDoc<Agent>(agentRef);

    const propertiesQuery = query(
        collection(firestore, 'properties'), 
        where('agentId', '==', id)
    );
    const { data: rawProperties, loading: propertiesLoading } = useCollection<Property>(propertiesQuery);
    
    const properties = useMemo(() => {
        if (!rawProperties) return [];
        return [...rawProperties].sort((a, b) => {
            const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
            const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
            return timeB - timeA;
        });
    }, [rawProperties]);

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
        } finally {
            setIsContacting(false);
        }
    }

    if (agentLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <h1 className="text-xl font-medium text-muted-foreground">Loading Profile...</h1>
            </div>
        );
    }

    if (!agent) return notFound();
    
    const aboutText = agent.about || `A seasoned professional with ${agent.experience || 0} years of experience in the Nigerian real estate market, ${agent.displayName} is dedicated to helping clients find their perfect home. Specializing in ${(agent.specialties || []).join(', ')}, they bring a wealth of local knowledge and a commitment to transparent transactions.`;

    return (
        <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="sticky top-24 overflow-hidden border-2">
                             <CardContent className="p-8 text-center bg-muted/5">
                                <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-background shadow-xl ring-2 ring-primary/20">
                                    <AvatarImage src={agent.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${agent.displayName || 'A'}`} alt={agent.displayName || 'Agent'} />
                                    <AvatarFallback className="text-3xl font-bold">{(agent.displayName || 'A').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h1 className="text-2xl font-bold">{agent.displayName}</h1>
                                <p className="text-primary font-medium mt-1">{agent.title || 'Real Estate Consultant'}</p>
                                <p className="text-muted-foreground text-sm">{agent.company || 'ApexFind Realty'}</p>
                                
                                <div className="mt-4 flex items-center justify-center gap-1.5 py-2 px-4 bg-yellow-50 text-yellow-800 rounded-full w-fit mx-auto border border-yellow-100">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="font-bold text-sm">{(agent.rating || 0).toFixed(1)}</span>
                                    <span className="text-xs opacity-80">({agent.reviewCount || 0} reviews)</span>
                                </div>
                                
                                <div className="mt-8 flex flex-col gap-3">
                                    <Button size="lg" className="h-12 text-lg font-bold gap-2" onClick={handleContactAgent} disabled={isContacting}>
                                        {isContacting ? <Loader2 className="h-5 w-5 animate-spin"/> : <MessageSquare className="h-5 w-5"/>}
                                        {isContacting ? 'Connecting...' : 'Chat Now'}
                                    </Button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="h-11" asChild>
                                            <a href={`mailto:${agent.email || ''}?subject=Inquiry via ApexFind`}>
                                                <Mail className="mr-2 h-4 w-4" /> Email
                                            </a>
                                        </Button>
                                        <Button variant="outline" className="h-11" onClick={handleContactAgent}>
                                            <Phone className="mr-2 h-4 w-4" /> Call
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                             <div className="grid grid-cols-2 border-t text-center divide-x bg-white">
                                <div className="p-5">
                                    <p className="text-3xl font-black text-primary">{agent.experience || 0}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Years Experience</p>
                                </div>
                                <div className="p-5">
                                    <p className="text-3xl font-black text-primary">{agent.sales || 0}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Closed Sales</p>
                                </div>
                            </div>
                        </Card>

                        {/* Professional Verification Card */}
                        <Card className="border-2">
                            <CardHeader className="border-b bg-muted/5">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    Professional Credentials
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {agent.licenseNumber ? (
                                    <div className="flex items-center justify-between p-4 bg-green-50 text-green-800 rounded-xl border border-green-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider block opacity-70">Verified License</span>
                                                <span className="font-mono font-bold text-sm">{agent.licenseNumber}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-600 text-white border-none">Active</Badge>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground flex items-center gap-3 italic">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Verification records being synced...
                                    </div>
                                )}

                                {agent.verificationBadges && agent.verificationBadges.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Memberships</p>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.verificationBadges.map(badge => (
                                                <Badge key={badge} variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-none text-xs font-bold">
                                                    {badge}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-3xl font-extrabold mb-6">About {agent.displayName}</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed bg-white p-6 rounded-2xl border shadow-sm">
                                {aboutText}
                            </p>
                             <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                                        <Star className="h-4 w-4 text-primary" /> Specialties
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(agent.specialties || ['Residential Real Estate']).map(s => (
                                            <Badge key={s} variant="outline" className="rounded-md px-3 h-8 border-primary/20 font-medium">{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-primary" /> Languages
                                    </p>
                                    <p className="text-lg font-semibold text-foreground">
                                        {(agent.languages || ['English']).join(' • ')}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="pt-8 border-t">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-extrabold">Active Listings</h2>
                                <Badge variant="outline" className="text-lg px-4 h-9 font-black border-2">{properties?.length || 0}</Badge>
                            </div>
                             <div className="mt-6">
                                {propertiesLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[...Array(2)].map((_, i) => <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />)}
                                    </div>
                                ) : (
                                     properties && properties.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {properties.map(prop => (
                                                <PropertyCard key={prop.id} property={prop} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                                            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                                            <h3 className="text-xl font-bold text-muted-foreground">No active listings</h3>
                                            <p className="text-sm text-muted-foreground/70 mt-1">Check back soon for new properties from this agent.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        <section className="pt-8 border-t">
                             <h2 className="text-3xl font-extrabold mb-8">Client Testimonials</h2>
                              <div className="text-center py-20 bg-primary/5 rounded-2xl border border-primary/10">
                                    <Star className="mx-auto h-12 w-12 text-primary opacity-20 mb-4" />
                                    <h3 className="text-xl font-bold">Trusted by Clients</h3>
                                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                        Verified reviews from home buyers and sellers are currently being verified.
                                    </p>
                                </div>
                        </section>
                    </div>
                </div>
            </div>
            
            <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create an Account to Continue</AlertDialogTitle>
                  <AlertDialogDescription>
                    To save properties, schedule tours, and contact agents directly, you need to have an account. It's free and only takes a minute!
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

// Simple fallback icon since globe might not be imported
function Globe(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    )
}
