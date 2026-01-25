
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDoc,
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
 * A hook to fetch a document from Firestore using React Query.
 * @param ref The reference to the document. Can be null if the reference is not ready.
 * @returns The document data, loading state, and error state.
 */
export function useDoc<T = DocumentData>(
  ref: DocumentReference<T> | null
): HookResult<(T & {id: string}) | null> {
  
  const queryKey = ['firestore-doc', ref?.path];
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!ref) return null;
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() as T };
      }
      return null;
    },
    enabled: !!ref, // Only run the query if the ref is not null
  });

  if (isLoading) {
    return { data: undefined, loading: true, error: undefined };
  }

  if (isError) {
    return { data: undefined, loading: false, error: error as Error };
  }

  // React Query returns `undefined` while loading, so we ensure the output is consistent.
  // The `?? null` handles the case where data is `undefined` after loading is complete.
  return { data: data ?? null, loading: false, error: undefined };
}
