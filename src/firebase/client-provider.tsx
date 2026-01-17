'use client';

import {useEffect, useState} from 'react';

import {initializeApp, type FirebaseOptions} from 'firebase/app';
import {connectAuthEmulator, getAuth} from 'firebase/auth';
import {connectFirestoreEmulator, getFirestore} from 'firebase/firestore';

import {FirebaseProvider} from './provider';

/**
 * Initializes a Firebase app instance and returns the emulated
 * services.
 */
function initializeEmulatedFirebase(options: FirebaseOptions) {
  const app = initializeApp(options);
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');

  return {
    app,
    firestore,
    auth,
  };
}

/**
 * A client-side provider that initializes Firebase and provides it to the
 * rest of the application.
 *
 * It is responsible for ensuring that Firebase is initialized only once.
 */
export function FirebaseClientProvider({
  children,
  options,
}: {
  children: React.ReactNode;
  options: FirebaseOptions;
}) {
  const [firebase, setFirebase] = useState(() =>
    initializeEmulatedFirebase(options)
  );

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
