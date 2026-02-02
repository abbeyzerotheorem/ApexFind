
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Award, 
  Building2,
  ChevronDown,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import type { Agency } from '@/types';
import { Badge } from '@/components/ui/badge';

const SPECIALTIES = ["Luxury", "Commercial", "Residential", "Rentals", "Short-lets", "Land Sales"];
const NIGERIAN_STATES = ["Lagos", "Abuja", "Rivers", "Oyo", "Enugu", "Delta"];

export default function AgencyDirectoryPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStates, setSelectedStates] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

    const agenciesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'agencies'), orderBy('rating', 'desc'));
    }, [firestore]);

    const { data: agencies, loading } = useCollection<Agency>(agenciesQuery);

    const filteredAgencies = useMemo(() => {
        if (!agencies) return [];
        return agencies.filter(agency => {
            const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesState = selectedStates.length === 0 || selectedStates.includes(agency.location);
            const matchesSpecialty = selectedSpecialties.length === 0 || 
                agency.specialties?.some(s => selectedSpecialties.includes(s));
            
            return matchesSearch && matchesState && matchesSpecialty;
        });
    }, [agencies, searchTerm, selectedStates, selectedSpecialties]);

    return (
        <div className="bg-background min-h-screen py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Agency Directory
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Discover and verify the best real estate firms in Nigeria. Find trusted professionals for your property journey.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-12">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input 
                            placeholder="Search agencies by name..." 
                            className="pl-10 h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-12 gap-2">
                                    <MapPin className="h-4 w-4" /> Location <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {NIGERIAN_STATES.map(state => (
                                    <DropdownMenuCheckboxItem 
                                        key={state}
                                        checked={selectedStates.includes(state)}
                                        onCheckedChange={() => setSelectedStates(prev => 
                                            prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
                                        )}
                                    >
                                        {state}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-12 gap-2">
                                    <Award className="h-4 w-4" /> Specialty <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {SPECIALTIES.map(spec => (
                                    <DropdownMenuCheckboxItem 
                                        key={spec}
                                        checked={selectedSpecialties.includes(spec)}
                                        onCheckedChange={() => setSelectedSpecialties(prev => 
                                            prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
                                        )}
                                    >
                                        {spec}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAgencies.map(agency => (
                            <AgencyCard key={agency.id} agency={agency} />
                        ))}
                        {filteredAgencies.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-muted/30 rounded-xl">
                                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold">No Agencies Found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function AgencyCard({ agency }: { agency: Agency }) {
    return (
        <Link href={`/agencies/${agency.id}`}>
            <div className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/50">
                <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-16 w-16 rounded-lg border">
                        <AvatarImage src={agency.photoURL} alt={agency.name} />
                        <AvatarFallback className="rounded-lg">{agency.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                            {agency.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {agency.location}, Nigeria
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">{agency.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({agency.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {agency.verificationBadges?.map(badge => (
                            <Badge key={badge} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent gap-1">
                                <ShieldCheck className="h-3 w-3" /> {badge}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-sm pt-4 border-t">
                        <div>
                            <p className="text-muted-foreground">Experience</p>
                            <p className="font-bold">{agency.yearsInOperation}+ Years</p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">License</p>
                            <p className="font-bold font-mono text-xs">{agency.licenseNumber}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
