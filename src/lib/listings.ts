'use client';

import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp,
    type Firestore 
} from 'firebase/firestore';
import { uploadToCloudinary } from './cloudinary';
import type { Property } from '@/types';

type PropertyFormData = Omit<Property, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>;

export async function uploadPropertyImage(
    file: File, 
    onProgress: (progress: number | null) => void
): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    
    try {
        const result = await uploadToCloudinary(file, (progress) => {
            onProgress(progress);
        });
        return result.optimizedUrl;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        onProgress(null); // Indicate error
        throw error;
    }
}


export async function addListing(firestore: Firestore, userId: string, data: Partial<PropertyFormData>) {
    if (!userId) throw new Error("User must be authenticated to add a listing.");
    
    await addDoc(collection(firestore, 'properties'), {
        ...data,
        agentId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateListing(firestore: Firestore, propertyId: string, data: Partial<PropertyFormData>) {
    const propertyRef = doc(firestore, 'properties', propertyId);
    await updateDoc(propertyRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}


export async function deleteListing(firestore: Firestore, propertyId: string) {
    const propertyRef = doc(firestore, 'properties', propertyId);
    await deleteDoc(propertyRef);
}
