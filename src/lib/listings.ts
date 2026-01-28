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
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';
import type { Property } from '@/types';

type PropertyFormData = Omit<Property, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>;

export async function uploadPropertyImage(
    file: File,
    userId: string,
    onProgress: (progress: number | null) => void
): Promise<string> {
    if (!file) {
        throw new Error("No file provided for upload.");
    }
    if (!userId) {
        throw new Error("User ID is required for image upload.");
    }

    const app = getApp();
    const storage = getStorage(app);
    const storageRef = ref(storage, `properties/${userId}/${Date.now()}-${file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("Firebase Storage upload failed:", error);
                onProgress(null);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch(error => {
                    console.error("Failed to get download URL:", error);
                    reject(error);
                });
            }
        );
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
