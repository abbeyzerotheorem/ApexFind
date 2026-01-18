'use client';
import { doc, setDoc, serverTimestamp, type Firestore, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
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


export async function removeViewedProperty(
    firestore: Firestore,
    userId: string,
    propertyId: string
) {
    if (!firestore || !userId || !propertyId) {
        return;
    }

    const viewedPropertyRef = doc(firestore, `users/${userId}/viewed_properties`, propertyId);
    try {
        await deleteDoc(viewedPropertyRef);
    } catch (error) {
        console.error("Error removing viewed property:", error);
    }
}

export async function clearViewedHistory(
    firestore: Firestore,
    userId: string,
) {
    if (!firestore || !userId) {
        return;
    }

    const viewedPropertiesRef = collection(firestore, `users/${userId}/viewed_properties`);
    try {
        const snapshot = await getDocs(viewedPropertiesRef);
        if (snapshot.empty) {
            return;
        }
        const batch = writeBatch(firestore);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error clearing viewed history:", error);
    }
}
