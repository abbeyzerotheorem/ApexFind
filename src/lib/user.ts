
'use client';

import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc, type Firestore } from 'firebase/firestore';

interface UserProfileData {
    displayName?: string;
    phoneNumber?: string;
    photoURL?: string;
    about?: string;
    specialties?: string[];
    languages?: string[];
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
    

    // Update Firestore document
    if (Object.keys(firestoreData).length > 0) {
        const userDocRef = doc(firestore, 'users', userId);
        tasks.push(setDoc(userDocRef, firestoreData, { merge: true }));
    }

    await Promise.all(tasks);
}
