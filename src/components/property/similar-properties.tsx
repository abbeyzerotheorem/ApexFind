
'use client';

import { useCollection, useFirestore, useUser } from '@/firebase';
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
            limit(4) // Fetch 3 similar + the current one which we'll filter out
        );
    }, [firestore, currentProperty]);

    const { data: properties, loading } = useCollection<Property>(similarPropertiesQuery);

    const usersQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, "users"));
    }, [firestore]);
    const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

    const activeProperties = useMemo(() => {
        if (!properties || !allUsers) return [];
        const activeUserIds = new Set(allUsers.map(user => user.id));
        return properties.filter(p => activeUserIds.has(p.agentId));
    }, [properties, allUsers]);

    const filteredProperties = useMemo(() => {
        if (!activeProperties) return [];
        // Filter out the current property and take the first 3
        return activeProperties.filter(p => p.id !== currentProperty.id).slice(0, 3);
    }, [activeProperties, currentProperty.id]);
    
    if (loading || usersLoading) {
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
        return null; // Don't render the section if there are no similar properties
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
