'use client';

import {useEffect, useState, useRef} from 'react';

import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  where,
  type DocumentData,
  type Firestore,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';

import {useFirebase} from './provider';

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
 * @param path The path to the collection.
 * @returns The collection data, loading state, and error state.
 */
export function useCollection<T = DocumentData>(
  path: string
): HookResult<Array<T & {id: string}>>;

/**
 * A hook to fetch a collection from Firestore.
 * @param ref The reference to the collection.
 * @returns The collection data, loading state, and error state.
 */
export function useCollection<T = DocumentData>(
  ref: CollectionReference<T>
): HookResult<Array<T & {id: string}>>;

/**
 * A hook to fetch a collection from Firestore.
 * @param q The query to the collection.
 * @returns The collection data, loading state, and error state.
 */
export function useCollection<T = DocumentData>(
  q: Query<T>
): HookResult<Array<T & {id: string}>>;

export function useCollection<T = DocumentData>(
  pathOrRefOrQuery: string | CollectionReference<T> | Query<T>
): HookResult<Array<T & {id: string}>> {
  const {firestore} = useFirebase();

  const [data, setData] = useState<Array<T & {id: string}> | undefined>(
    undefined
  );
  const [error, setError] = useState<Error | undefined>(undefined);

  const query =
    typeof pathOrRefOrQuery === 'string'
      ? collection(firestore, pathOrRefOrQuery)
      : pathOrRefOrQuery;

  const queryRef = useRef(query);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      queryRef.current,
      snapshot => {
        const data: Array<T & {id: string}> = [];

        snapshot.forEach(doc => {
          data.push({
            id: doc.id,
            ...(doc.data() as T),
          });
        });

        setData(data);
      },
      error => {
        setError(error);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  const loading = data === undefined;

  return {data, loading, error} as HookResult<Array<T & {id: string}>>;
}
