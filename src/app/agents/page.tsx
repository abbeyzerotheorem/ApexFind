
'use client';
import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Star, Loader2, Phone, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation } from '@/lib/chat';
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
} from "@/components/ui/alert-dialog";

type AgentUser = {
    id: string;
    displayName?: string | null;
    photoURL?: string | null;
    role?: 'agent' | 'customer';
};


export default function AgentSearchPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    
    const agentsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'agent'));
    }, [firestore]);

    const userProfileRef = useMemo(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile } = useDoc(userProfileRef);

    const { data: allAgents, loading } = useCollection<Omit<AgentUser, 'id'>>(agentsQuery);

    const filteredAgents = useMemo(() => {
        if (!allAgents) return [];
        if (!searchTerm) return allAgents;

        const term = searchTerm.toLowerCase();
        return allAgents.filter(agent => 
            agent.displayName?.toLowerCase().includes(term)
        );
    }, [allAgents, searchTerm]);


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Find a Local Real Estate Agent
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Connect with trusted agents to help you with your buying and selling needs.
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-2">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                            type="text"
                            placeholder="Search by name"
                            className="w-full pl-10 h-12 text-base"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex gap-4">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full h-12 text-base justify-between">
                                    Languages <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuCheckboxItem>English</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Yoruba</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Igbo</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Hausa</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full h-12 text-base justify-between">
                                    Services <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuCheckboxItem>Luxury Homes</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>First-time Buyers</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Commercial</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Rentals</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading && <div className="col-span-full flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {!loading && filteredAgents?.map(agent => (
                        <AgentCard key={agent.id} agent={agent} currentUserRole={userProfile?.role} />
                    ))}
                    {!loading && (!filteredAgents || filteredAgents.length === 0) && (
                        <div className="col-span-full text-center py-12">
                            <h3 className="text-xl font-semibold">No Agents Found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your search or check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function AgentCard({ agent, currentUserRole }: { agent: AgentUser, currentUserRole?: 'agent' | 'customer' }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isContacting, setIsContacting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    
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

    const handleDeleteAgent = async () => {
        if (!firestore) return;
        setIsDeleting(true);
        try {
            const agentDocRef = doc(firestore, 'users', agent.id);
            await deleteDoc(agentDocRef);
            // This invalidates all queries that use the 'users' collection,
            // forcing a refetch on the agents page and the homepage components.
            await queryClient.invalidateQueries({ queryKey: ['firestore-collection', 'users'] });
        } catch (error) {
            console.error("Failed to delete agent:", error);
        } finally {
            setIsDeleting(false);
        }
    }

    const agentProfile = {
        id: agent.id,
        name: agent.displayName || 'Unnamed Agent',
        title: 'Real Estate Agent',
        company: 'ApexFind',
        imageUrl: agent.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${agent.displayName || 'A'}`,
        imageHint: "agent portrait",
        experience: 5,
        sales: 32,
        rating: 4.8,
        reviewCount: 55,
    };

    const canDelete = currentUserRole === 'agent' && user?.uid !== agent.id;

    return (
        <>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg flex flex-col">
                <div className="p-6 text-center">
                    <Link href={`/agents/${agentProfile.id}`}>
                        <Avatar className="h-24 w-24 mx-auto mb-4">
                            <AvatarImage src={agentProfile.imageUrl} alt={agentProfile.name} data-ai-hint={agentProfile.imageHint} />
                            <AvatarFallback>{agentProfile.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">{agentProfile.name}</h3>
                    </Link>
                    <p className="text-muted-foreground">{agentProfile.title}, {agentProfile.company}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">{agentProfile.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({agentProfile.reviewCount} reviews)</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 border-t text-center">
                    <div className="p-4 border-r">
                        <p className="text-2xl font-bold">{agentProfile.experience} yrs</p>
                        <p className="text-sm text-muted-foreground">Experience</p>
                    </div>
                    <div className="p-4">
                        <p className="text-2xl font-bold">{agentProfile.sales}</p>
                        <p className="text-sm text-muted-foreground">Sales (24 mo)</p>
                    </div>
                </div>
                <div className="p-6 mt-auto">
                     <Button className="w-full" onClick={handleContactAgent} disabled={isContacting}>
                        {isContacting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Phone className="mr-2 h-4 w-4"/>}
                        {isContacting ? 'Contacting...' : 'Contact Agent'}
                    </Button>
                    {canDelete && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full mt-2" disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                                    {isDeleting ? 'Deleting...' : 'Delete Agent'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the agent's profile and all associated data. Their listings will be removed from the site. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAgent}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
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
        </>
    )
}
