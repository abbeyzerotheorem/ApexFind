'use client';

import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc, type Firestore } from 'firebase/firestore';

interface UserProfileData {
    displayName?: string;
    phoneNumber?: string;
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

    // Update Firebase Auth profile if displayName is provided
    if (data.displayName && data.displayName !== currentUser.displayName) {
        tasks.push(updateProfile(currentUser, { displayName: data.displayName }));
    }

    // Prepare data for Firestore, don't write undefined values.
    const firestoreData: { [key: string]: any } = {};
    if (data.displayName !== undefined) {
        firestoreData.displayName = data.displayName;
    }
     if (data.phoneNumber !== undefined) {
        firestoreData.phoneNumber = data.phoneNumber;
    }

    // Update Firestore document
    if (Object.keys(firestoreData).length > 0) {
        const userDocRef = doc(firestore, 'users', userId);
        tasks.push(setDoc(userDocRef, firestoreData, { merge: true }));
    }

    await Promise.all(tasks);
}
