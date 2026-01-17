
'use client';

import { createClient } from './supabase/client';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import { useFirebase } from '@/firebase';

const supabase = createClient();

export async function signUp(name: string, email: string, password: string) {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // Supabase logic is kept for now to avoid breaking existing email verification flows
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
        data: {
            full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        throw error;
    }

    return userCredential;
}

export async function signIn(email: string, password:string ) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  const auth = getAuth();
  await firebaseSignOut(auth);
  // Also sign out from Supabase to clear its session
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out from Supabase:', error);
  }
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
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
