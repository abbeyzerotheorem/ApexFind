
'use client';

import {useEffect, useState} from 'react';

import {
  onSnapshot,
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
 * A hook to fetch a collection from Firestore.
 * @param q The query to the collection. Can be null if the query is not ready.
 * @returns The collection data, loading state, and error state.
 */
export function useCollection<T = DocumentData>(
  q: Query<T> | null
): HookResult<Array<T & {id: string}>> {
  const [state, setState] = useState<HookResult<Array<T & {id: string}>>>({
    data: undefined,
    loading: true,
    error: undefined,
  });

  const queryPath = (q as any)?._query?.path?.canonical ?? null;

  useEffect(() => {
    if (q === null) {
      // If there is no query, we are not loading and have no data.
      setState({ data: [], loading: false, error: undefined });
      return;
    }

    // There is a query, so we are loading until we get a snapshot.
    setState(prevState => ({ ...prevState, loading: true }));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const docs: Array<T & {id: string}> = [];
        snapshot.forEach(doc => {
          docs.push({
            id: doc.id,
            ...(doc.data() as T),
          });
        });
        setState({ data: docs, loading: false, error: undefined });
      },
      err => {
        setState({ data: undefined, loading: false, error: err });
      }
    );

    return () => unsubscribe();
  }, [queryPath]);

  return state;
}
