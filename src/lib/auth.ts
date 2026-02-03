'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export async function signUp(name: string, email: string, password: string, role: 'customer' | 'agent') {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    // Send verification email immediately after sign up
    await sendEmailVerification(userCredential.user);

    const db = getFirestore(getApp());
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
        displayName: name,
        email: email,
        role: role,
        createdAt: serverTimestamp(),
    });

    return userCredential;
}

export async function signIn(email: string, password:string ) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const db = getFirestore(getApp());
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'customer', // Default to customer for Google sign-ins
            createdAt: serverTimestamp(),
        });
    }

    return result;
}

export async function signOut() {
  const auth = getAuth();
  await firebaseSignOut(auth);
}

export async function resetPasswordForEmail(email: string) {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/callback`,
    });
}

export async function resendVerificationEmail() {
    const auth = getAuth();
    if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
    } else {
        throw new Error("No user is currently signed in.");
    }
}

export async function updateUserPassword(password: string) {
    const auth = getAuth();
    if (auth.currentUser) {
        return updatePassword(auth.currentUser, password);
    }
    throw new Error("No user is currently signed in.");
}
