'use client';

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Property } from '@/types';
import { PropertyCard } from '../property-card';
import { Skeleton } from '../ui/skeleton';

export default function SimilarProperties({ currentProperty }: { currentProperty: Property }) {
    const firestore = useFirestore();

    const similarPropertiesQuery = useMemo(() => {
        if (!firestore || !currentProperty) return null;
        return query(
            collection(firestore, 'properties'),
            where('city', '==', currentProperty.city),
            where('home_type', '==', currentProperty.home_type),
            limit(4)
        );
    }, [firestore, currentProperty]);

    const { data: properties, loading } = useCollection<Property>(similarPropertiesQuery);

    const filteredProperties = useMemo(() => {
        if (!properties) return [];
        return properties.filter(p => p.id !== currentProperty.id).slice(0, 3);
    }, [properties, currentProperty.id]);
    
    if (loading) {
        return (
             <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground">Similar Properties in {currentProperty.city}</h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                </div>
            </div>
        );
    }

    if (!filteredProperties || filteredProperties.length === 0) {
        return null;
    }
    
    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground">Similar Properties in {currentProperty.city}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProperties.map(prop => (
                    <PropertyCard key={prop.id} property={prop} />
                ))}
            </div>
        </div>
    );
}