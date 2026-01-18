
'use client';
import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { trackViewedProperty } from '@/lib/history';
import type { Property } from '@/types';

// This is a client component that handles a side-effect and renders nothing.
export function TrackView({ property }: { property: Property }) {
    const { user } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (user && firestore && property) {
            trackViewedProperty(firestore, user.uid, property);
        }
    }, [user, firestore, property]);

    return null; // This component doesn't render anything visible
}
