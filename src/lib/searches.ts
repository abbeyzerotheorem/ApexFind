'use client';

import { addDoc, collection, serverTimestamp, type Firestore } from "firebase/firestore";
import { formatNairaShort } from "./naira-formatter";

function generateSearchDescription(params: URLSearchParams): string {
    const parts: string[] = [];
    const q = params.get('q');
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    const beds = params.get('beds');
    const baths = params.get('baths');
    const homeTypes = params.get('homeTypes');
    const type = params.get('type');

    if (q) {
        parts.push(q);
    }

    if (type) {
        parts.push(type === 'buy' ? 'For Sale' : (type === 'rent' ? 'For Rent' : ''));
    }

    if (minPrice || (maxPrice && Number(maxPrice) < 500000000)) {
        const min = minPrice ? formatNairaShort(Number(minPrice)) : '₦0';
        const max = (maxPrice && Number(maxPrice) < 500000000) ? formatNairaShort(Number(maxPrice)) : 'Any';
        if (min !== '₦0' || max !== 'Any') {
             parts.push(`${min} - ${max}`);
        }
    }
    
    if (beds && beds !== 'any') {
        parts.push(`${beds.replace('+', '')}+ Beds`);
    }
    
    if (baths && baths !== 'any') {
        parts.push(`${baths.replace('+', '')}+ Baths`);
    }

    if (homeTypes) {
        parts.push(homeTypes.split(',').join(', '));
    }
    
    if (parts.length === 0) {
        return "All Properties";
    }

    return parts.filter(p => p).join(' • ');
}


export async function saveSearch(
    firestore: Firestore, 
    userId: string, 
    searchName: string, 
    searchParamsString: string
) {
    if (!firestore || !userId || !searchName) {
        throw new Error("Firestore instance, User ID and search name are required.");
    }

    const searchParams = new URLSearchParams(searchParamsString);
    const description = generateSearchDescription(searchParams);

    const savedSearchesRef = collection(firestore, `users/${userId}/saved_searches`);
    
    try {
        await addDoc(savedSearchesRef, {
            name: searchName,
            description: description,
            searchParams: searchParamsString,
            alertFrequency: 'daily',
            newMatchCount: 0,
            createdAt: serverTimestamp(),
        });
    } catch(error) {
        console.error("Error saving search: ", error);
        throw error;
    }
}
