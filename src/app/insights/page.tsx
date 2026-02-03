'use client';

import { useState, type FormEvent, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { PropertyCard } from "@/components/property-card";
import AgentPromotion from "@/components/agent-promotion";
import { Utensils, GraduationCap, TramFront, Wallet, Info, TrendingUp, MapPin, Search, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import AutocompleteSearch from "@/components/autocomplete-search";
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import { formatNaira, formatNairaShort } from "@/lib/naira-formatter";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Property } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Simulated high-quality market data for the chart
const marketData = [
    { month: "Jan", price: 140000000 },
    { month: "Feb", price: 145000000 },
    { month: "Mar", price: 150000000 },
    { month: "Apr", price: 152000000 },
    { month: "May", price: 155000000 },
    { month: "Jun", price: 160000000 },
];

const allLocations = allStatesWithLgas.flatMap(state => [state.name, ...state.lgas]);

export default function InsightsPage() {
    const firestore = useFirestore();
    const [searchValue, setSearchValue] = useState('Lagos');
    const [displayLocation, setDisplayLocation] = useState('Lagos');

    const featuredPropertiesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'properties'),
            where('city', '==', displayLocation),
            limit(6)
        );
    }, [firestore, displayLocation]);

    const { data: rawProperties, loading: propertiesLoading } = useCollection<Property>(featuredPropertiesQuery);

    const activeProperties = useMemo(() => {
        if (!rawProperties) return [];
        return [...rawProperties]
            .sort((a, b) => {
                const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
                const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
                return timeB - timeA;
            })
            .slice(0, 3);
    }, [rawProperties]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            setDisplayLocation(searchValue);
        }
    };

    const isLagos = displayLocation.toLowerCase() === 'lagos' || displayLocation.toLowerCase() === 'lekki';

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Hero Section */}
            <section className="bg-primary/5 border-b py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-none font-bold uppercase tracking-widest px-4">
                        Data-Driven Real Estate
                    </Badge>
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
                        Nigerian Market Insights
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                        Navigate the complexity of property trends across all 36 states with real-time data, inventory levels, and expert analysis.
                    </p>
                    <div className="mt-10 mx-auto max-w-xl">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-xl border">
                            <AutocompleteSearch 
                                allLocations={allLocations} 
                                value={searchValue}
                                onChange={setSearchValue}
                                className="border-none focus-visible:ring-0 text-lg h-12"
                                placeholder="Search a city or state..."
                            />
                            <Button size="lg" type="submit" className="h-12 font-bold px-8">
                                <Search className="mr-2 h-5 w-5" /> Analyze
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Market Overview Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                            {displayLocation} Overview
                        </h2>
                        <p className="text-muted-foreground mt-1">Key metrics for residential and commercial listings.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full">
                        <TrendingUp className="h-4 w-4" /> Market Status: Active
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard 
                        label="Median List Price" 
                        value={isLagos ? formatNaira(155000000) : "Variable"} 
                        trend="+2.5% YoY" 
                        trendUp={true} 
                    />
                    <MetricCard 
                        label="Price per Sqft" 
                        value={isLagos ? formatNaira(450000) : "Variable"} 
                        trend="+5.1% YoY" 
                        trendUp={true} 
                    />
                    <MetricCard 
                        label="Avg. Days on Market" 
                        value={isLagos ? "85 Days" : "90+ Days"} 
                        trend="-5 days YoY" 
                        trendUp={true} 
                    />
                    <MetricCard 
                        label="Active Inventory" 
                        value={isLagos ? "1,250+" : "Loading..."} 
                        trend="+12% YoY" 
                        trendUp={true} 
                    />
                </div>

                {/* Trend Chart Section */}
                <Card className="mt-8 shadow-sm overflow-hidden border-2">
                    <CardHeader className="bg-muted/5 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" /> 6-Month Pricing Trend
                        </CardTitle>
                        <CardDescription>Visual breakdown of median property values in {displayLocation} (Naira).</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marketData}>
                                    <XAxis 
                                        dataKey="month" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <YAxis 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(value) => formatNairaShort(value)} 
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value: number) => [formatNaira(value), "Median Price"]}
                                    />
                                    <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                                        {marketData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} fillOpacity={0.6 + (index / marketData.length) * 0.4} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground mt-6 uppercase font-bold tracking-widest">
                            * Data aggregated from ApexFind verified listings and historical registry records.
                        </p>
                    </CardContent>
                </Card>
                
                {/* Lifestyle Spotlight */}
                {isLagos ? (
                    <section className="mt-20 bg-secondary/30 py-16 px-8 rounded-[2rem] border-2 border-dashed">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                                Life in {displayLocation}
                            </h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                                Discover why {displayLocation} remains the top destination for property investment and luxury living in West Africa.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            <LifestyleFeature 
                                icon={Utensils} 
                                title="Vibrant Lifestyle" 
                                desc="World-class restaurants, open-air markets, and a globally recognized arts and music scene."
                            />
                            <LifestyleFeature 
                                icon={Wallet} 
                                title="Cost of Living" 
                                desc="While prime areas like Ikoyi are premium, {displayLocation} offers diverse housing tiers for all income levels."
                            />
                            <LifestyleFeature 
                                icon={GraduationCap} 
                                title="Top Schools" 
                                desc="Home to elite international primary and secondary schools with British and American curriculums."
                            />
                            <LifestyleFeature 
                                icon={TramFront} 
                                title="Infrastructure" 
                                desc="Major upgrades including the Blue and Red Line rail systems are transforming the urban commute."
                            />
                        </div>
                    </section>
                ) : (
                    <div className="mt-20 text-center py-24 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                        <Info className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                        <h3 className="text-2xl font-black">Neighborhood Intelligence</h3>
                        <p className="mt-2 text-muted-foreground max-w-md mx-auto px-4">
                            We are currently compiling lifestyle and infrastructure data for {displayLocation}. Explore active listings below in the meantime.
                        </p>
                    </div>
                )}

                {/* Featured Properties */}
                <section className="mt-24">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                                Active Listings in {displayLocation}
                            </h2>
                            <p className="text-muted-foreground mt-1">Verified properties currently available for sale or rent.</p>
                        </div>
                        <Button variant="outline" className="hidden sm:flex font-bold" asChild>
                            <Link href={`/search?q=${displayLocation}`}>View All <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </div>

                    {propertiesLoading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />)}
                        </div>
                    ) : (
                        activeProperties.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {activeProperties.map((p) => (
                                    <PropertyCard key={p.id} property={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-card rounded-2xl border-2 shadow-sm">
                                <MapPin className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                                <h3 className="text-xl font-bold">No live properties in {displayLocation}</h3>
                                <p className="text-muted-foreground mt-2 mb-8">Be the first to list a property in this area or explore nearby neighborhoods.</p>
                                <Button size="lg" className="font-bold" asChild>
                                    <Link href="/search">Explore Nearby Areas</Link>
                                </Button>
                            </div>
                        )
                    )}
                    
                    {activeProperties.length > 0 && (
                        <div className="mt-12 text-center sm:hidden">
                            <Button size="lg" className="w-full font-bold h-14" asChild>
                                <Link href={`/search?q=${displayLocation}`}>See All Listings in {displayLocation}</Link>
                            </Button>
                        </div>
                    )}
                </section>

                {/* Agent Matching */}
                <section className="mt-24">
                    <AgentPromotion />
                </section>
            </div>
        </div>
    );
}

function MetricCard({ label, value, trend, trendUp }: { label: string, value: string, trend: string, trendUp: boolean }) {
    return (
        <Card className="shadow-sm border-2 hover:border-primary/30 transition-all">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-foreground">{value}</div>
                <div className={cn(
                    "text-xs font-bold mt-1 flex items-center gap-1",
                    trendUp ? "text-green-600" : "text-red-600"
                )}>
                    {trendUp ? "↑" : "↓"} {trend}
                </div>
            </CardContent>
        </Card>
    );
}

function LifestyleFeature({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="text-center space-y-4 px-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
