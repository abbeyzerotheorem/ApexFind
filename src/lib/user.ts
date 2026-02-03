
'use client';

import { getAuth, updateProfile, deleteUser } from 'firebase/auth';
import { doc, setDoc, type Firestore, collection, query, where, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { uploadToCloudinary } from './cloudinary';

interface UserProfileData {
    displayName?: string;
    phoneNumber?: string;
    photoURL?: string;
    about?: string;
    specialties?: string[];
    languages?: string[];
    title?: string;
    company?: string;
    experience?: number;
    sales?: number;
}

export async function uploadProfilePicture(
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

    const folder = `profile-pictures/${userId}`;
    
    try {
        const result = await uploadToCloudinary(file, (progress) => {
            onProgress(progress);
        }, folder);
        return result.optimizedUrl; 
    } catch (error) {
        onProgress(null);
        console.error("Cloudinary upload failed:", error);
        throw error;
    }
}


/**
 * Updates the user's profile in Firebase Authentication and their document in Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to update.
 * @param data - The data to update.
 */
export async function updateUserProfile(
    firestore: Firestore,
    userId: string,
    data: UserProfileData
) {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== userId) {
        throw new Error("User not authenticated or permission denied.");
    }

    const tasks = [];
    const authProfileUpdate: { displayName?: string; photoURL?: string; } = {};

    if (data.displayName && data.displayName !== currentUser.displayName) {
        authProfileUpdate.displayName = data.displayName;
    }
    if (data.photoURL && data.photoURL !== currentUser.photoURL) {
        authProfileUpdate.photoURL = data.photoURL;
    }

    if (Object.keys(authProfileUpdate).length > 0) {
        tasks.push(updateProfile(currentUser, authProfileUpdate));
    }


    // Prepare data for Firestore, don't write undefined values.
    const firestoreData: { [key: string]: any } = {};
    if (data.displayName !== undefined) firestoreData.displayName = data.displayName;
    if (data.phoneNumber !== undefined) firestoreData.phoneNumber = data.phoneNumber;
    if (data.photoURL !== undefined) firestoreData.photoURL = data.photoURL;
    if (data.about !== undefined) firestoreData.about = data.about;
    if (data.specialties !== undefined) firestoreData.specialties = data.specialties;
    if (data.languages !== undefined) firestoreData.languages = data.languages;
    if (data.title !== undefined) firestoreData.title = data.title;
    if (data.company !== undefined) firestoreData.company = data.company;
    if (data.experience !== undefined) firestoreData.experience = data.experience;
    if (data.sales !== undefined) firestoreData.sales = data.sales;
    

    // Update Firestore document
    if (Object.keys(firestoreData).length > 0) {
        const userDocRef = doc(firestore, 'users', userId);
        tasks.push(setDoc(userDocRef, firestoreData, { merge: true }));
    }

    await Promise.all(tasks);
}


export async function deleteUserAccount(
    firestore: Firestore,
    userId: string,
    userRole: 'customer' | 'agent' | undefined
) {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== userId) {
        throw new Error("User not authenticated or permission denied.");
    }

    const deleteSubcollection = async (subcollectionName: string) => {
        const subcollectionRef = collection(firestore, 'users', userId, subcollectionName);
        const snapshot = await getDocs(subcollectionRef);
        if (snapshot.empty) return;
        
        // Firestore batches are limited to 500 operations
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
            const batch = writeBatch(firestore);
            const chunk = docs.slice(i, i + 500);
            chunk.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    };

    // If user is an agent, delete their properties from the top-level collection
    if (userRole === 'agent') {
        const propertiesRef = collection(firestore, 'properties');
        const q = query(propertiesRef, where('agentId', '==', userId));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const docs = snapshot.docs;
            for (let i = 0; i < docs.length; i += 500) {
                const batch = writeBatch(firestore);
                const chunk = docs.slice(i, i + 500);
                chunk.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
        }
    }
    
    // Delete user's subcollections
    await Promise.all([
        deleteSubcollection('saved_homes'),
        deleteSubcollection('saved_searches'),
        deleteSubcollection('viewed_properties'),
    ]);

    // Delete the main user document
    const userDocRef = doc(firestore, 'users', userId);
    await deleteDoc(userDocRef);

    // Delete the user from Firebase Authentication
    // This is the last and most sensitive step
    await deleteUser(currentUser);
}
