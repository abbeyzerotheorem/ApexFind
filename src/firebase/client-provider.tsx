'use client';

import {useState} from 'react';
import {initializeApp, getApps, type FirebaseOptions} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {FirebaseProvider} from './provider';

/**
 * Initializes a Firebase app instance and returns the services.
 * It ensures that Firebase is initialized only once.
 */
function initializeFirebase(options: FirebaseOptions) {
  // Check if Firebase has already been initialized
  const existingApp = getApps().length ? getApps()[0] : null;
  const app = existingApp || initializeApp(options);
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  return {
    app,
    firestore,
    auth,
  };
}

/**
 * A client-side provider that initializes Firebase and provides it to the
 * rest of the application.
 */
export function FirebaseClientProvider({
  children,
  options,
}: {
  children: React.ReactNode;
  options: FirebaseOptions;
}) {
  const [firebase] = useState(() => initializeFirebase(options));

  return (
    <FirebaseProvider
      app={firebase.app}
      auth={firebase.auth}
      firestore={firebase.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
