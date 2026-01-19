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
import { 
    getStorage, 
    ref, 
    uploadBytesResumable, 
    getDownloadURL 
} from 'firebase/storage';
import type { Property } from '@/types';

type PropertyFormData = Omit<Property, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>;

export function uploadPropertyImage(
    file: File, 
    userId: string, 
    onProgress: (progress: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No file provided for upload."));
        }
        if (!userId) {
            return reject(new Error("User must be authenticated to upload an image."));
        }

        const storage = getStorage();
        const filePath = `properties/${userId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
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
