
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
  const [state, setState] = useState<HookResult<(T & {id: string}) | null>>({
    data: undefined,
    loading: true,
    error: undefined,
  });

  const refPath = ref?.path ?? null;

  useEffect(() => {
    // When ref changes, go back to loading state.
    setState({ data: undefined, loading: true, error: undefined });
    
    if (ref === null) {
        // If the reference is not ready, we are waiting for dependencies.
        // The state is already set to loading, so we wait.
        return;
    }
    
    const unsubscribe = onSnapshot(
      ref,
      snapshot => {
        if (snapshot.exists()) {
          setState({
            data: { id: snapshot.id, ...snapshot.data() as T },
            loading: false,
            error: undefined
          });
        } else {
          // Document does not exist, this is a valid loaded state.
          setState({ data: null, loading: false, error: undefined });
        }
      },
      err => {
        setState({ data: undefined, loading: false, error: err });
      }
    );

    return () => unsubscribe();
  }, [refPath]);

  return state;
}
