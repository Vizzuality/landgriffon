import Fuse from 'fuse.js';
import { useCallback, useMemo, useState } from 'react';

import type { DeepKeys } from '@tanstack/react-table';
import type { ChangeEvent } from 'react';

type UseFuseReturn<T> = Readonly<{
  result: readonly T[];
  search: (search: string | ChangeEvent<HTMLInputElement>) => void;
  term: string;
  reset: () => void;
}>;

type SeparateDots<T> = T extends `${infer A}.${infer B}` ? [A, ...SeparateDots<B>] : [T];

type KeyType<T> = SeparateDots<DeepKeys<T>> | DeepKeys<T>;

export interface UseFuseOptions<T> extends Omit<Fuse.IFuseOptions<T>, 'keys'> {
  keys?: (KeyType<T> | { name: KeyType<T>; weight: number })[];
}

const useFuse = <T>(data: readonly T[], options: UseFuseOptions<T> = {}): UseFuseReturn<T> => {
  const [term, setTerm] = useState('');

  const search = useCallback<UseFuseReturn<T>['search']>((search) => {
    if (typeof search === 'string') {
      setTerm(search);
    } else {
      setTerm(search.target.value);
    }
  }, []);

  const reset = useCallback(() => setTerm(''), []);

  const fuse = useMemo(() => new Fuse(data, options as Fuse.IFuseOptions<T>), [data, options]);
  const result = useMemo(
    () => (term ? fuse.search(term).map((result) => result.item) : data),
    [data, fuse, term],
  );

  return { result, term, search, reset };
};

export default useFuse;
