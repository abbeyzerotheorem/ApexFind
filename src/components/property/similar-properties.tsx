
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Property } from '@/types';
import { PropertyCard } from '../property-card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function SimilarProperties({ currentProperty }: { currentProperty: Property }) {
    const firestore = useFirestore();

    // Fetch properties in the same city and of the same listing type (sale vs rent)
    const similarPropertiesQuery = useMemo(() => {
        if (!firestore || !currentProperty) return null;
        return query(
            collection(firestore, 'properties'),
            where('city', '==', currentProperty.city),
            where('listing_type', '==', currentProperty.listing_type),
            limit(15) // Fetch a slightly larger batch to rank them in memory
        );
    }, [firestore, currentProperty]);

    const { data: rawProperties, loading } = useCollection<Property>(similarPropertiesQuery);

    const matchedProperties = useMemo(() => {
        if (!rawProperties || !currentProperty) return [];

        return rawProperties
            .filter(p => p.id !== currentProperty.id)
            .map(p => {
                let score = 0;
                
                // Exact home type match is very important (e.g. Duplex to Duplex)
                if (p.home_type === currentProperty.home_type) score += 50;
                
                // Price proximity (closer price = higher score)
                const priceDiffPercent = Math.abs(p.price - currentProperty.price) / currentProperty.price;
                score += Math.max(0, 30 * (1 - priceDiffPercent));
                
                // Bedroom match
                if (p.beds === currentProperty.beds) score += 10;
                else if (Math.abs(p.beds - currentProperty.beds) === 1) score += 5;

                return { property: p, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.property);
    }, [rawProperties, currentProperty]);
    
    if (loading) {
        return (
             <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (!matchedProperties || matchedProperties.length === 0) {
        return (
            <div className="mt-12 py-16 bg-muted/20 rounded-[2rem] border-2 border-dashed text-center">
                <Sparkles className="mx-auto h-10 w-10 text-primary opacity-30 mb-4" />
                <h3 className="text-xl font-bold">More to Explore</h3>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                    We're finding more great properties in {currentProperty.city}. Check back soon or broaden your search criteria.
                </p>
                <Button variant="outline" className="mt-6 font-bold" asChild>
                    <Link href="/search">Browse All Listings</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">
                        Similar Listings in {currentProperty.city}
                    </h2>
                    <p className="text-muted-foreground mt-1">Based on location, price, and property type.</p>
                </div>
                <Button variant="ghost" className="font-bold text-primary hover:text-primary hover:bg-primary/5 group" asChild>
                    <Link href={`/search?q=${currentProperty.city}&type=${currentProperty.listing_type}`}>
                        View all in {currentProperty.city} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {matchedProperties.map(prop => (
                    <PropertyCard key={prop.id} property={prop} />
                ))}
            </div>
        </div>
    );
}
