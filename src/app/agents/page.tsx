'use client';
import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Star, Loader2, Phone, FilterX, UserCheck } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import type { Agent } from '@/types';

const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "French", "Pidgin"];
const SPECIALTIES = ["Luxury Homes", "First-time Buyers", "Commercial", "Rentals", "Land Sales", "Short-lets"];

export default function AgentSearchPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    
    const agentsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'agent'));
    }, [firestore]);

    const { data: allAgents, loading } = useCollection<Agent>(agentsQuery);

    const filteredAgents = useMemo(() => {
        if (!allAgents) return [];
        
        return allAgents.filter(agent => {
            const matchesSearch = !searchTerm || 
                (agent.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (agent.company || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesLanguage = selectedLanguages.length === 0 || 
                (agent.languages || []).some(l => selectedLanguages.includes(l));
                
            const matchesSpecialty = selectedSpecialties.length === 0 || 
                (agent.specialties || []).some(s => selectedSpecialties.includes(s));
            
            return matchesSearch && matchesLanguage && matchesSpecialty;
        });
    }, [allAgents, searchTerm, selectedLanguages, selectedSpecialties]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedLanguages([]);
        setSelectedSpecialties([]);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Find a Local Real Estate Agent
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Connect with verified Nigerian professionals who know your neighborhood inside-out.
                    </p>
                </div>

                <div className="mb-8 flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input 
                            type="text"
                            placeholder="Search by agent name or company..."
                            className="w-full pl-10 h-12 text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex-1 sm:w-44 h-12 text-base justify-between gap-2">
                                    Languages <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>Filter by Language</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {LANGUAGES.map(lang => (
                                    <DropdownMenuCheckboxItem 
                                        key={lang}
                                        checked={selectedLanguages.includes(lang)}
                                        onCheckedChange={(checked) => {
                                            setSelectedLanguages(prev => checked ? [...prev, lang] : prev.filter(l => l !== lang))
                                        }}
                                    >
                                        {lang}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex-1 sm:w-44 h-12 text-base justify-between gap-2">
                                    Specialties <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>Filter by Expertise</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {SPECIALITIES.map(spec => (
                                    <DropdownMenuCheckboxItem 
                                        key={spec}
                                        checked={selectedSpecialties.includes(spec)}
                                        onCheckedChange={(checked) => {
                                            setSelectedSpecialties(prev => checked ? [...prev, spec] : prev.filter(s => s !== spec))
                                        }}
                                    >
                                        {spec}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {(searchTerm || selectedLanguages.length > 0 || selectedSpecialties.length > 0) && (
                            <Button variant="ghost" onClick={resetFilters} className="h-12 px-4 gap-2 text-muted-foreground">
                                <FilterX className="h-4 w-4" /> Clear
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading && <div className="col-span-full flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
                    {!loading && filteredAgents?.map(agent => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                    {!loading && (!filteredAgents || filteredAgents.length === 0) && (
                        <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl border-2 border-dashed">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold">No Agents Found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
                            <Button variant="link" onClick={resetFilters} className="mt-4">Show all verified agents</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function AgentCard({ agent }: { agent: Agent }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [isContacting, setIsContacting] = useState(false);
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

    return (
        <>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg hover:border-primary/30 flex flex-col overflow-hidden group">
                <div className="p-6 text-center">
                    <Link href={`/agents/${agent.id}`}>
                        <div className="relative inline-block mb-4">
                            <Avatar className="h-24 w-24 border-2 border-background shadow-md">
                                <AvatarImage src={agent.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${agent.displayName || 'A'}`} alt={agent.displayName || 'Agent'} />
                                <AvatarFallback className="text-2xl font-bold">{(agent.displayName || 'A').split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            {agent.licenseNumber && (
                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1 rounded-full border-2 border-background shadow-sm" title="Verified Professional">
                                    <UserCheck className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{agent.displayName || 'Unnamed Agent'}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {agent.title || 'Real Estate Consultant'} • {agent.company || 'ApexFind'}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-sm">{(agent.rating || 5.0).toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs">({agent.reviewCount || 0} reviews)</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 border-y text-center bg-muted/5">
                    <div className="p-3 border-r">
                        <p className="text-lg font-bold">{agent.experience || 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Years Exp.</p>
                    </div>
                    <div className="p-3">
                        <p className="text-lg font-bold">{agent.sales || 0}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sales Closed</p>
                    </div>
                </div>

                <div className="p-6 mt-auto">
                     <Button className="w-full h-11 font-bold shadow-sm" onClick={handleContactAgent} disabled={isContacting}>
                        {isContacting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Phone className="mr-2 h-4 w-4"/>}
                        {isContacting ? 'Contacting...' : 'Contact Agent'}
                    </Button>
                </div>
            </div>
            
            <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Create an Account to Continue</AlertDialogTitle>
                  <AlertDialogDescription>
                    To contact agents directly, save properties, and manage inquiries, you need to be signed in. It's free and takes less than a minute.
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
