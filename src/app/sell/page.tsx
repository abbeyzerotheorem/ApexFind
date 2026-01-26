'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { estimatePropertyValue, type EstimateValueOutput } from '@/ai/property-value-flow';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNaira } from '@/lib/naira-formatter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SellPage() {
    const [address, setAddress] = useState('');
    const [estimation, setEstimation] = useState<EstimateValueOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetEstimate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim()) {
            setError("Please enter a property address.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setEstimation(null);

        try {
            const result = await estimatePropertyValue({ address });
            setEstimation(result);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className="bg-secondary py-20 sm:py-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                            Sell Your Home with Confidence
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                            ApexFind provides you with the tools and insights you need to sell your home faster and for the best price.
                        </p>
                        <div className="mt-10 mx-auto max-w-xl">
                            <form onSubmit={handleGetEstimate} className="flex flex-col sm:flex-row gap-4">
                                <Input
                                    type="text"
                                    placeholder="Enter your home address"
                                    className="h-12 text-base flex-grow"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                <Button size="lg" type="submit" className="h-12 font-medium" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Get Your Free Estimate"}
                                </Button>
                            </form>
                            <p className="mt-4 text-sm text-muted-foreground">
                                Get a data-driven estimate of your home's value, instantly.
                            </p>
                        </div>

                        {error && (
                             <Alert variant="destructive" className="mt-8 max-w-xl mx-auto text-left">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        {estimation && (
                            <Card className="mt-8 max-w-xl mx-auto text-left">
                                <CardHeader>
                                    <CardTitle>Your ApexFind Estimate</CardTitle>
                                    <CardDescription>Based on our AI analysis for: {address}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-4xl font-bold text-primary">{formatNaira(estimation.estimatedValue)}</p>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm">
                                            <span className="font-semibold">Confidence: </span> 
                                            <span>{estimation.confidence}</span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">{estimation.comparablesSummary}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                                        This is an AI-generated estimate and not an official appraisal. For a more accurate valuation, connect with a local real estate agent.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            </section>
            
            <section className="py-20 sm:py-24">
                 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                            Why Sell with ApexFind?
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <h3 className="text-2xl font-semibold">Maximum Exposure</h3>
                            <p className="mt-2 text-muted-foreground">Your listing will be seen by millions of potential buyers on our platform.</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold">Expert Guidance</h3>
                            <p className="mt-2 text-muted-foreground">Connect with top-rated local agents who know your market inside and out.</p>
                        </div>
                         <div>
                            <h3 className="text-2xl font-semibold">Powerful Tools</h3>
                            <p className="mt-2 text-muted-foreground">From pricing assistance to market trend analysis, we've got you covered.</p>
                        </div>
                    </div>
                     <div className="mt-16 text-center">
                         <Button size="lg" variant="outline">Find a Seller's Agent</Button>
                    </div>
                </div>
            </section>
        </>
    )
}
