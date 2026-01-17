'use client';

import {useEffect, useState} from 'react';

import {onAuthStateChanged, type User} from 'firebase/auth';

import {useAuth} from './provider';

/**
 * A hook to get the current user.
 * @returns The current user, or null if the user is not signed in.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return {
    user,
    loading,
  };
}
