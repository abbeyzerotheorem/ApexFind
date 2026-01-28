'use client';

import { useState, type FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { PropertyCard } from "@/components/property-card";
import AgentPromotion from "@/components/agent-promotion";
import { Utensils, GraduationCap, TramFront, Wallet } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { PlaceHolderImages } from "@/lib/placeholder-images";
import AutocompleteSearch from "@/components/autocomplete-search";
import allStatesWithLgas from "@/jsons/nigeria-states.json";
import { formatNaira, formatNairaShort } from "@/lib/naira-formatter";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import type { Property } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

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
    const router = useRouter();
    const firestore = useFirestore();
    const [searchValue, setSearchValue] = useState('Lagos');

    const featuredPropertiesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'properties'),
            where('city', '==', 'Lagos'),
            orderBy('createdAt', 'desc'),
            limit(3)
        );
    }, [firestore]);

    const { data: featuredProperties, loading: propertiesLoading } = useCollection<Property>(featuredPropertiesQuery);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${searchValue}`);
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
                                Search
                            </Button>
                        </form>
                    </div>
                </div>

                <section className="mt-16">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center mb-10">
                        Lagos Market Overview
                    </h2>
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
                </section>
                
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
                            <p className="mt-2 text-muted-foreground">From world-class restaurants and bustling open-air markets to a thriving arts and music scene, Lagos offers a dynamic cultural experience. Explore high-end boutiques in Victoria Island or discover unique crafts at the Lekki Arts & Crafts Market.</p>
                        </div>
                        <div className="text-center">
                            <Wallet className="h-10 w-10 text-primary mx-auto"/>
                            <h3 className="mt-4 text-xl font-semibold">Cost of Living</h3>
                            <p className="mt-2 text-muted-foreground">While housing in prime areas like Ikoyi and Lekki is expensive, Lagos offers a wide range of options. Daily expenses for food and transport are affordable, but costs vary significantly based on lifestyle and location.</p>
                        </div>
                        <div className="text-center">
                            <GraduationCap className="h-10 w-10 text-primary mx-auto"/>
                            <h3 className="mt-4 text-xl font-semibold">Top Schools</h3>
                            <p className="mt-2 text-muted-foreground">The city is home to top-tier private primary and secondary schools with international curriculums. It also hosts prestigious universities like the University of Lagos, making it a hub for education and research in West Africa.</p>
                        </div>
                        <div className="text-center">
                            <TramFront className="h-10 w-10 text-primary mx-auto"/>
                            <h3 className="mt-4 text-xl font-semibold">Improving Commute</h3>
                            <p className="mt-2 text-muted-foreground">Navigating Lagos is easier with major infrastructure projects. The new Blue and Red Line rail systems are set to significantly reduce traffic, complementing the existing network of ferries and an expanding road system.</p>
                        </div>
                    </div>
                </section>

                <section className="mt-20">
                    <div className="text-center">
                         <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Neighborhood Highlights
                        </h2>
                          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                            Explore the diverse neighborhoods of Lagos.
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card>
                            {neighborhoodImage && <Image src={neighborhoodImage.imageUrl} alt="Ikoyi" width={600} height={400} className="rounded-t-lg object-cover w-full aspect-[4/3]" />}
                            <CardHeader>
                                <CardTitle>Ikoyi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Known for its luxury apartments, high-end boutiques, and exclusive social clubs. A prime location for affluent professionals and expatriates.</p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <span className="text-sm text-muted-foreground">Median Price</span>
                                    <span className="font-bold text-lg">{formatNaira(350000000)}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            {neighborhoodImage && <Image src={PlaceHolderImages.find(i=>i.id==='property-2')?.imageUrl ?? ""} alt="Lekki" width={600} height={400} className="rounded-t-lg object-cover w-full aspect-[4/3]" />}
                            <CardHeader>
                                <CardTitle>Lekki</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">A sprawling, rapidly developing area popular with young professionals and families, offering a mix of modern estates and vibrant commercial centers.</p>
                                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <span className="text-sm text-muted-foreground">Median Price</span>
                                    <span className="font-bold text-lg">{formatNaira(120000000)}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             {neighborhoodImage && <Image src={PlaceHolderImages.find(i=>i.id==='property-6')?.imageUrl ?? ""} alt="Ikeja" width={600} height={400} className="rounded-t-lg object-cover w-full aspect-[4/3]" />}
                            <CardHeader>
                                <CardTitle>Ikeja</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">The state capital, a bustling commercial and administrative hub with a mix of residential areas, government offices, and the city's main airport.</p>
                                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <span className="text-sm text-muted-foreground">Median Price</span>
                                    <span className="font-bold text-lg">{formatNaira(85000000)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>


                <section className="mt-20">
                     <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Featured Homes for Sale in Lagos
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
                            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {featuredProperties?.map((p) => (
                                    <PropertyCard key={p.id} property={p} />
                                ))}
                            </div>
                            <div className="mt-12 text-center">
                                 <Button size="lg" asChild>
                                    <Link href="/search?q=Lagos">See More Homes in Lagos</Link>
                                 </Button>
                            </div>
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
