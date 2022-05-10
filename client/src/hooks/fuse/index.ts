import Fuse from 'fuse.js';
import { useCallback, useMemo, useState } from 'react';

interface UseFuseReturn<T> {
  result: T[];
  search: (search: string) => void;
  term: string;
  reset: () => void;
}

const useFuse: <T>(data: T[], options?: Fuse.IFuseOptions<T>) => UseFuseReturn<T> = (
  data,
  options = {},
) => {
  const [term, setTerm] = useState('');

  const reset = useCallback(() => setTerm(''), []);

  const fuse = useMemo(() => new Fuse(data, options), [data, options]);
  const result = useMemo(
    () => (term ? fuse.search(term).map((result) => result.item) : data),
    [data, fuse, term],
  );

  return { result, term, search: setTerm, reset };
};

export default useFuse;
