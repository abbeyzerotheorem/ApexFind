
'use client';
import { doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { Property } from '@/types';

export async function trackViewedProperty(
    firestore: Firestore,
    userId: string,
    property: Property
) {
    if (!firestore || !userId || !property) {
        return;
    }

    const viewedPropertyRef = doc(firestore, `users/${userId}/viewed_properties`, String(property.id));

    try {
        await setDoc(viewedPropertyRef, {
            property_data: property,
            viewed_at: serverTimestamp()
        }, { merge: true }); // Use merge to avoid overwriting if it exists, just update timestamp
    } catch (error) {
        console.error("Error tracking viewed property:", error);
        // Don't throw, as this is a background task and shouldn't block UI
    }
}
