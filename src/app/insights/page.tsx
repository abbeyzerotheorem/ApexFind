'use client';

import { useState, type FormEvent, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { PropertyCard } from "@/components/property-card";
import AgentPromotion from "@/components/agent-promotion";
import { Utensils, GraduationCap, TramFront, Wallet, Info } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import AutocompleteSearch from "@/components/autocomplete-search";
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import { formatNaira, formatNairaShort } from "@/lib/naira-formatter";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Property } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const marketData = [
    { month: "Jan", price: 140000000 },
    { month: "Feb", price: 145000000 },
    { month: "Mar", price: 150000000 },
    { month: "Apr", price: 152000000 },
    { month: "May", price: 155000000 },
    { month: "Jun", price: 160000000 },
];

const neighborhoodImage = PlaceHolderImages.find((img) => img.id === "property-1");
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
            limit(10)
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
        setDisplayLocation(searchValue);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                        Explore Real Estate Markets
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Get the latest data, trends, and insights to make informed decisions about where to buy, sell, or rent your next home.
                    </p>
                    <div className="mt-8 mx-auto max-w-xl">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                            <AutocompleteSearch 
                                allLocations={allLocations} 
                                value={searchValue}
                                onChange={setSearchValue}
                            />
                            <Button size="lg" type="submit" className="h-12 font-medium">
                                Search Insights
                            </Button>
                        </form>
                    </div>
                </div>

                <section className="mt-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center mb-10">
                        {displayLocation} Market Overview
                    </h2>
                    {displayLocation.toLowerCase() === 'lagos' ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium text-muted-foreground">Median List Price</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold">{formatNaira(155000000)}</p>
                                        <p className="text-sm text-green-600">+2.5% YoY</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium text-muted-foreground">Median Price/Sqft</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold">{formatNaira(450000)}</p>
                                         <p className="text-sm text-green-600">+5.1% YoY</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium text-muted-foreground">Avg. Days on Market</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold">85</p>
                                         <p className="text-sm text-red-600">-5 days YoY</p>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium text-muted-foreground">For Sale Inventory</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold">1,250</p>
                                         <p className="text-sm text-green-600">+12% YoY</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle>Median List Price Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={marketData}>
                                            <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                                            <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => formatNairaShort(value as number)} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                                formatter={(value: number) => [formatNaira(value), "Median Price"]}
                                            />
                                            <Bar dataKey="price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <p className="text-xs text-muted-foreground text-center mt-2">Note: Market data shown is for illustrative purposes for the Lagos area.</p>
                        </>
                    ) : (
                         <div className="text-center py-16 bg-secondary rounded-lg">
                            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-xl font-semibold">Detailed Insights Coming Soon</h3>
                            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                                Detailed market statistics for {displayLocation} are not yet available. In the meantime, explore featured properties below.
                            </p>
                        </div>
                    )}
                </section>
                
                {displayLocation.toLowerCase() === 'lagos' && (
                    <>
                        <section className="mt-20 bg-secondary py-16 rounded-lg">
                            <div className="text-center px-4">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    Life in Lagos
                                </h2>
                                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                                    Discover what it's like to live in Nigeria's vibrant economic hub.
                                </p>
                            </div>
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
                                <div className="text-center">
                                    <Utensils className="h-10 w-10 text-primary mx-auto"/>
                                    <h3 className="mt-4 text-xl font-semibold">Vibrant Lifestyle</h3>
                                    <p className="mt-2 text-muted-foreground">From world-class restaurants and bustling open-air markets to a thriving arts and music scene, Lagos offers a dynamic cultural experience.</p>
                                </div>
                                <div className="text-center">
                                    <Wallet className="h-10 w-10 text-primary mx-auto"/>
                                    <h3 className="mt-4 text-xl font-semibold">Cost of Living</h3>
                                    <p className="mt-2 text-muted-foreground">While housing in prime areas is expensive, Lagos offers a wide range of options. Daily expenses are generally affordable.</p>
                                </div>
                                <div className="text-center">
                                    <GraduationCap className="h-10 w-10 text-primary mx-auto"/>
                                    <h3 className="mt-4 text-xl font-semibold">Top Schools</h3>
                                    <p className="mt-2 text-muted-foreground">The city is home to top-tier private primary and secondary schools with international curriculums.</p>
                                </div>
                                <div className="text-center">
                                    <TramFront className="h-10 w-10 text-primary mx-auto"/>
                                    <h3 className="mt-4 text-xl font-semibold">Improving Commute</h3>
                                    <p className="mt-2 text-muted-foreground">Navigating Lagos is easier with major infrastructure projects like the new Blue and Red Line rail systems.</p>
                                </div>
                            </div>
                        </section>
                    </>
                )}


                <section className="mt-20">
                     <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Featured Homes for Sale in {displayLocation}
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                            Browse a selection of popular properties currently on the market.
                        </p>
                    </div>
                    {propertiesLoading ? (
                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                        </div>
                    ) : (
                        <>
                            {activeProperties && activeProperties.length > 0 ? (
                                <>
                                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {activeProperties?.map((p) => (
                                            <PropertyCard key={p.id} property={p} />
                                        ))}
                                    </div>
                                    <div className="mt-12 text-center">
                                         <Button size="lg" asChild>
                                            <Link href={`/search?q=${displayLocation}`}>See More Homes in {displayLocation}</Link>
                                         </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-12 text-center py-16 bg-secondary rounded-lg">
                                    <h3 className="text-xl font-semibold">No Featured Properties Found</h3>
                                    <p className="text-muted-foreground mt-2">There are currently no featured properties for {displayLocation}.</p>
                                     <Button size="lg" asChild className="mt-6">
                                        <Link href={`/search?q=${displayLocation}`}>Search All Homes in {displayLocation}</Link>
                                     </Button>
                                </div>
                            )}
                        </>
                    )}
                </section>

                 <section className="mt-20">
                    <AgentPromotion />
                </section>

            </div>
        </div>
    );
}