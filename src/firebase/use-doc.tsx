'use client';

import {useEffect, useState, useRef} from 'react';

import {
  getFirestore,
  onSnapshot,
  doc,
  type DocumentData,
  type Firestore,
  type DocumentReference,
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
 * A hook to fetch a document from Firestore.
 * @param path The path to the document.
 * @returns The document data, loading state, and error state.
 */
export function useDoc<T = DocumentData>(
  path: string
): HookResult<T & {id: string}>;

/**
 * A hook to fetch a document from Firestore.
 * @param ref The reference to the document.
 * @returns The document data, loading state, and error state.
 */
export function useDoc<T = DocumentData>(
  ref: DocumentReference<T>
): HookResult<T & {id: string}>;

export function useDoc<T = DocumentData>(
  pathOrRef: string | DocumentReference<T>
): HookResult<T & {id: string}> {
  const {firestore} = useFirebase();

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const docRef =
    typeof pathOrRef === 'string'
      ? doc(firestore, pathOrRef)
      : (pathOrRef as DocumentReference<T>);

  const docRefRef = useRef(docRef);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      docRefRef.current,
      snapshot => {
        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...snapshot.data(),
          } as T);
        } else {
          setData(undefined);
        }
      },
      error => {
        setError(error);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  const loading = data === undefined;

  return {data, loading, error} as HookResult<T & {id: string}>;
}
