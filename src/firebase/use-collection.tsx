
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getDocs,
  type DocumentData,
  type Query,
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
 * A hook to fetch a collection from Firestore using React Query.
 * @param q The query to the collection. Can be null if the query is not ready.
 * @returns The collection data, loading state, and error state.
 */
export function useCollection<T = DocumentData>(
  q: Query<T> | null
): HookResult<Array<T & {id: string}>> {

  // Generate a stable key for the query based on its path.
  const queryPath = (q as any)?._query?.path?.canonical ?? null;
  const queryKey = ['firestore-collection', queryPath];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
        if (!q) return [];
        const snapshot = await getDocs(q);
        const docs: Array<T & {id: string}> = [];
        snapshot.forEach(doc => {
            docs.push({
            id: doc.id,
            ...(doc.data() as T),
            });
        });
        return docs;
    },
    enabled: !!q, // Only run query if `q` is not null
  });

  if (isLoading) {
    return { data: undefined, loading: true, error: undefined };
  }

  if (isError) {
    return { data: undefined, loading: false, error: error as Error };
  }

  // React Query returns `undefined` while loading, so `?? []` ensures we always return an array.
  return { data: data ?? [], loading: false, error: undefined };
}
