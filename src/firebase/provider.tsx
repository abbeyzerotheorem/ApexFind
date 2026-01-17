'use client';

import {createContext, useContext, type ReactNode} from 'react';

import type {FirebaseApp} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import type {Firestore} from 'firebase/firestore';

/**
 * The props for the `FirebaseProvider` component.
 */
interface FirebaseProviderProps {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  children: ReactNode;
}

/**
 * The context for the Firebase services.
 */
const FirebaseContext = createContext<
  | {
      app: FirebaseApp;
      auth: Auth;
      firestore: Firestore;
    }
  | undefined
>(undefined);

/**
 * Provides the Firebase services to the rest of the application.
 *
 * It is used by the `useFirebase`, `useFirestore`, `useAuth`, and
 * `useFirebaseApp` hooks.
 */
export function FirebaseProvider({
  app,
  auth,
  firestore,
  children,
}: FirebaseProviderProps) {
  return (
    <FirebaseContext.Provider value={{app, firestore, auth}}>
      {children}
    </FirebaseContext.Provider>
  );
}

/**
 * A hook to get the Firebase services.
 * @returns The Firebase services.
 * @throws An error if the hook is not used within a `FirebaseProvider`.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);

  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }

  return context;
}

/**
 * A hook to get the Firestore instance.
 * @returns The Firestore instance.
 */
export function useFirestore() {
  return useFirebase().firestore;
}

/**
 * A hook to get the Auth instance.
 * @returns The Auth instance.
 */
export function useAuth() {
  return useFirebase().auth;
}

/**
 * A hook to get the FirebaseApp instance.
 * @returns The FirebaseApp instance.
 */
export function useFirebaseApp() {
  return useFirebase().app;
}
