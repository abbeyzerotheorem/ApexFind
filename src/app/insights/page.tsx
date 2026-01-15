
'use client';

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";
import { PropertyCard } from "@/components/property-card";
import AgentPromotion from "@/components/agent-promotion";
import { Utensils, FerrisWheel, GraduationCap, TramFront } from "lucide-react";

const marketData = [
    { month: "Jan", price: 140 },
    { month: "Feb", price: 145 },
    { month: "Mar", price: 150 },
    { month: "Apr", price: 152 },
    { month: "May", price: 155 },
    { month: "Jun", price: 160 },
];

const featuredProperties = PlaceHolderProperties.slice(0, 3);

export default function InsightsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-grow py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                            Explore Local Real Estate Markets
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
                            Get the latest data, trends, and insights to make informed decisions about where to buy, sell, or rent your next home.
                        </p>
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
                                    <p className="text-3xl font-bold">₦155,000,000</p>
                                    <p className="text-sm text-green-600">+2.5% YoY</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-medium text-muted-foreground">Median Price/Sqft</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">₦450,000</p>
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
                                        <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `₦${value}M`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                            formatter={(value: number) => [`₦${value},000,000`, "Median Price"]}
                                        />
                                        <Bar dataKey="price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
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
                                <p className="mt-2 text-muted-foreground">From world-class restaurants to bustling markets and a thriving arts scene, Lagos offers a dynamic cultural experience.</p>
                            </div>
                             <div className="text-center">
                                <FerrisWheel className="h-10 w-10 text-primary mx-auto"/>
                                <h3 className="mt-4 text-xl font-semibold">Entertainment</h3>
                                <p className="mt-2 text-muted-foreground">Enjoy beautiful beaches, luxury resorts, and a nightlife scene that is second to none in West Africa.</p>
                            </div>
                             <div className="text-center">
                                <GraduationCap className="h-10 w-10 text-primary mx-auto"/>
                                <h3 className="mt-4 text-xl font-semibold">Top Schools</h3>
                                <p className="mt-2 text-muted-foreground">Home to some of the nation's top universities and a wide range of excellent primary and secondary schools.</p>
                            </div>
                             <div className="text-center">
                                <TramFront className="h-10 w-10 text-primary mx-auto"/>
                                <h3 className="mt-4 text-xl font-semibold">Improving Commute</h3>
                                <p className="mt-2 text-muted-foreground">Major infrastructure projects, including the Blue and Red Line rail systems, are transforming how Lagosians move around the city.</p>
                            </div>
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
                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredProperties.map((p) => (
                                <PropertyCard key={p.id} property={p} />
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                             <Button size="lg">See More Homes</Button>
                        </div>
                    </section>

                     <section className="mt-20">
                        <AgentPromotion />
                    </section>

                </div>
            </main>
            <Footer />
        </div>
    );
}
