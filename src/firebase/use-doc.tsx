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
): HookResult<T & {id: string}> {
  const [data, setData] = useState<(T & {id: string}) | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // If the reference is not ready, we can't fetch the document.
    if (ref === null) {
      setData(undefined);
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
          // Document does not exist
          setData(undefined);
        }
        setError(undefined);
      },
      err => {
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [ref]); // The dependency on the ref object is crucial for re-fetching data when the reference changes.

  const loading = data === undefined && error === undefined;

  return {data, loading, error} as HookResult<T & {id: string}>;
}
