
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
} from 'firebase/auth';

export async function signUp(name: string, email: string, password: string) {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential;
}

export async function signIn(email: string, password:string ) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
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

export async function updateUserPassword(password: string) {
    const auth = getAuth();
    if (auth.currentUser) {
        return updatePassword(auth.currentUser, password);
    }
    throw new Error("No user is currently signed in.");
}
