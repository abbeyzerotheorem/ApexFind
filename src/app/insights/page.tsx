
'use client';

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { PlaceHolderProperties } from "@/lib/placeholder-properties";
import { PropertyCard } from "@/components/property-card";
import AgentPromotion from "@/components/agent-promotion";

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
