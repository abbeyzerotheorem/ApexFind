
'use client';
import { useState } from 'react';
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { PlaceHolderAgents, Agent } from "@/lib/placeholder-agents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';

export default function AgentSearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [agents, setAgents] = useState(PlaceHolderAgents);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filteredAgents = PlaceHolderAgents.filter(agent => 
            agent.name.toLowerCase().includes(term) ||
            agent.company.toLowerCase().includes(term) ||
            agent.location.toLowerCase().includes(term)
        );
        setAgents(filteredAgents);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-grow py-8 sm:py-12">
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
                                placeholder="Search by name, company, or location"
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
                        {agents.map(agent => (
                            <AgentCard key={agent.id} agent={agent} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

function AgentCard({ agent }: { agent: Agent }) {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg">
            <div className="p-6 text-center">
                 <Link href={`/agents/${agent.id}`}>
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={agent.imageUrl} alt={agent.name} data-ai-hint={agent.imageHint} />
                        <AvatarFallback>{agent.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold">{agent.name}</h3>
                </Link>
                <p className="text-muted-foreground">{agent.title}, {agent.company}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{agent.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({agent.reviewCount} reviews)</span>
                </div>
            </div>
            <div className="grid grid-cols-2 border-t text-center">
                <div className="p-4 border-r">
                    <p className="text-2xl font-bold">{agent.experience} yrs</p>
                    <p className="text-sm text-muted-foreground">Experience</p>
                </div>
                <div className="p-4">
                    <p className="text-2xl font-bold">{agent.sales}</p>
                    <p className="text-sm text-muted-foreground">Sales (24 mo)</p>
                </div>
            </div>
            <div className="p-6">
                <Button className="w-full">Contact Agent</Button>
            </div>
        </div>
    )
}
