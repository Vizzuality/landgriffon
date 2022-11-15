import Fuse from 'fuse.js';
import { useMemo } from 'react';

import type { DeepKeys } from '@tanstack/react-table';

type SeparateDots<T> = T extends `${infer A}.${infer B}` ? [A, ...SeparateDots<B>] : [T];

type KeyType<T> = SeparateDots<DeepKeys<T>> | DeepKeys<T>;

export interface UseFuseOptions<T> extends Omit<Fuse.IFuseOptions<T>, 'keys'> {
  keys?: (KeyType<T> | { name: KeyType<T>; weight: number })[];
  searchTerm?: string;
}

const useFuse = <T>(data: T[], search?: string, options: UseFuseOptions<T> = {}): T[] => {
  const fuse = useMemo(() => new Fuse(data, options as Fuse.IFuseOptions<T>), [data, options]);
  const result = useMemo(
    () => (search ? fuse.search(search).map((result) => result.item) : data),
    [data, fuse, search],
  );

  return result;
};

export default useFuse;
