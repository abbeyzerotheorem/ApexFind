'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNaira } from '@/lib/naira-formatter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import allStatesWithLgas from "@/jsons/nigeria-states.json";

// This is the shape of the API response
type ValuationResponse = {
    estimatedValue: number;
    confidence: 'High' | 'Medium' | 'Low';
    comparablesSummary: string;
    valueRange: [number, number];
}

type FormValues = {
  address: string;
  city: string;
  state: string;
  home_type: string;
  beds: number;
  baths: number;
  sqft: number;
}

const homeTypeOptions = ["House", "Apartment (Flat)", "Duplex", "Terrace", "Bungalow", "Commercial"];
const stateOptions = allStatesWithLgas.map(s => s.name);


export default function SellPage() {
    const [estimation, setEstimation] = useState<ValuationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            address: '',
            city: 'Lagos',
            state: 'Lagos',
            home_type: 'House',
            beds: 3,
            baths: 2,
            sqft: 1500
        }
    });
    
    const selectedState = watch('state');
    const cityOptions = allStatesWithLgas.find(s => s.name === selectedState)?.lgas || [];

    const handleGetEstimate = async (data: FormValues) => {
        setIsLoading(true);
        setError(null);
        setEstimation(null);

        try {
            const response = await fetch('/api/valuation/instant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'An unexpected error occurred.');
            }
            
            setEstimation(result);
        } catch (err: any) {
            setError(err.message);
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
                            Get a data-driven valuation of your home's worth in today's market.
                        </p>
                    </div>
                </div>
            </section>
            
            <section className="py-20 sm:py-24">
                 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Get Your Free Home Estimate</CardTitle>
                            <CardDescription>Provide some details about your property for a more accurate valuation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <form onSubmit={handleSubmit(handleGetEstimate)} className="grid gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address</Label>
                                    <Input id="address" placeholder="e.g., 123 Main Street" {...register('address')} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Controller name="state" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {stateOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City / LGA</Label>
                                         <Controller name="city" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {cityOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                 <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="home_type">Home Type</Label>
                                        <Controller name="home_type" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {homeTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sqft">Size (sqft)</Label>
                                        <Input id="sqft" type="number" placeholder="e.g., 1500" {...register('sqft')} />
                                    </div>
                                </div>
                                 <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="beds">Bedrooms</Label>
                                        <Input id="beds" type="number" {...register('beds')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="baths">Bathrooms</Label>
                                        <Input id="baths" type="number" {...register('baths')} />
                                    </div>
                                </div>
                                
                                <Button size="lg" type="submit" className="w-full h-12 font-medium" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Get My Estimate"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    
                    {error && (
                         <Alert variant="destructive" className="mt-8">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {estimation && (
                        <Card className="mt-8 text-left">
                            <CardHeader>
                                <CardTitle>Your ApexFind Estimate</CardTitle>
                                <CardDescription>This is a data-driven estimate based on market trends and comparable properties.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-primary">{formatNaira(estimation.estimatedValue)}</p>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Value Range: {formatNaira(estimation.valueRange[0])} – {formatNaira(estimation.valueRange[1])}
                                </p>
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm">
                                        <span className="font-semibold">Confidence: </span> 
                                        <span>{estimation.confidence}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{estimation.comparablesSummary}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                                    This is not an official appraisal. For a more accurate valuation, connect with a local real estate agent.
                                </p>
                                <Button className="mt-6">Find a Seller's Agent</Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </>
    )
}
