import type { DeepKeys } from '@tanstack/react-table';
import Fuse from 'fuse.js';
import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

interface UseFuseReturn<T> {
  result: T[];
  search: (search: string | ChangeEvent<HTMLInputElement>) => void;
  term: string;
  reset: () => void;
}

export interface UseFuseOptions<T> extends Omit<Fuse.IFuseOptions<T>, 'keys'> {
  keys?: DeepKeys<T>[];
}

const useFuse = <T>(data: T[], options: UseFuseOptions<T> = {}): UseFuseReturn<T> => {
  const [term, setTerm] = useState('');

  const search = useCallback<UseFuseReturn<unknown>['search']>((search) => {
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
