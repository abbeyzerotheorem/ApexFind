'use client';

import {useEffect, useState} from 'react';

import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';

interface LoadingHook<T> {
  data: T | undefined;
  loading: true;
  error: undefined;
}

interface SuccessHook<T> {
  data: T;
  loading: false;
  error: undefined;
}

interface ErrorHook {
  data: undefined;
  loading: false;
  error: Error;
}

type HookResult<T> = LoadingHook<T> | SuccessHook<T> | ErrorHook;

/**
 * A hook to fetch a document from Firestore.
 * @param ref The reference to the document. Can be null if the reference is not ready.
 * @returns The document data, loading state, and error state.
 */
export function useDoc<T = DocumentData>(
  ref: DocumentReference<T> | null
): HookResult<(T & {id: string}) | null> {
  // undefined: not yet loaded. null: loaded, but doesn't exist. object: loaded and exists.
  const [data, setData] = useState<(T & {id: string}) | null | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // Reset state when ref changes to allow for re-loading.
    setData(undefined);
    setError(undefined);

    if (ref === null) {
      // If the reference is not ready, we can't fetch the document.
      // This is a valid "loaded but no data" state.
      setData(null);
      return;
    }
    
    const unsubscribe = onSnapshot(
      ref,
      snapshot => {
        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...(snapshot.data() as T),
          });
        } else {
          // Document does not exist, this is a valid loaded state.
          setData(null);
        }
        setError(undefined);
      },
      err => {
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [ref?.path]); // Depend on the path string which is stable, not the object reference.

  const loading = data === undefined && error === undefined;

  return {data, loading, error} as HookResult<(T & {id: string}) | null>;
}
