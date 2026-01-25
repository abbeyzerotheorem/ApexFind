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
  const [data, setData] = useState<Array<T & {id: string}> | undefined>(
    undefined
  );
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // When the query changes, reset the data to re-enter a loading state.
    // This is crucial for when the query transitions from null to a valid query.
    setData(undefined);
    setError(undefined);

    // If the query is not ready, for example, if we are waiting for a user to be authenticated,
    // we can return an empty array to signify that the collection is empty.
    if (q === null) {
      setData([]);
      return;
    }
    
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
        setData(docs);
        setError(undefined);
      },
      err => {
        setError(err);
      }
    );

    return () => unsubscribe();
  }, [q]); // The dependency on the query object is crucial for re-fetching data when the query changes.

  const loading = data === undefined && error === undefined;

  return {data, loading, error} as HookResult<Array<T & {id: string}>>;
}
