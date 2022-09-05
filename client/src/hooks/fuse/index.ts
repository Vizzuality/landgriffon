import Fuse from 'fuse.js';
import type { ChangeEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

interface UseFuseReturn<T> {
  result: T[];
  search: (search: string | ChangeEvent<HTMLInputElement>) => void;
  term: string;
  reset: () => void;
}

const useFuse: <T>(data: T[], options?: Fuse.IFuseOptions<T>) => UseFuseReturn<T> = (
  data,
  options = {},
) => {
  const [term, setTerm] = useState('');

  const search = useCallback<UseFuseReturn<unknown>['search']>((search) => {
    if (typeof search === 'string') {
      setTerm(search);
    } else {
      setTerm(search.target.value);
    }
  }, []);

  const reset = useCallback(() => setTerm(''), []);

  const fuse = useMemo(() => new Fuse(data, options), [data, options]);
  const result = useMemo(
    () => (term ? fuse.search(term).map((result) => result.item) : data),
    [data, fuse, term],
  );

  return { result, term, search, reset };
};

export default useFuse;
