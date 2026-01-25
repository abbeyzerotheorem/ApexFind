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

export function uploadPropertyImage(
    file: File, 
    onProgress: (progress: number | null) => void
): Promise<string> {
    return new Promise(async (resolve, reject) => {
        if (!file) {
            return reject(new Error("No file provided for upload."));
        }

        onProgress(50); // Indicate that the upload has started

        try {
            const result = await uploadToCloudinary(file);
            onProgress(100); // Indicate completion
            resolve(result.optimizedUrl);
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            onProgress(null); // Indicate error
            reject(error);
        }
    });
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
