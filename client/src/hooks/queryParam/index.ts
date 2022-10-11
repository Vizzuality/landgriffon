import { useRouter } from 'next/router';
import { useCallback, useState, useTransition } from 'react';
import { useDebounce, useEffectOnceWhen } from 'rooks';

interface UseQueryParamOptions<T, F = T> {
  /**
   * Format the param before it's JSON.stringified
   * Useful to store less information in the query params
   * and avoid clutter
   */
  formatParam?: (value: T) => F;
}

const serialize = <T>(value: T): string => {
  if (value === undefined) return undefined;

  return encodeURIComponent(JSON.stringify(value));
};

const parse = <T>(value: string): T => {
  if (value === undefined) return undefined;

  return JSON.parse(decodeURIComponent(value));
};

const useQueryParam = <T, F = T>(
  name: string,
  defaultValue?: T | (() => T),
  { formatParam }: UseQueryParamOptions<T, F> = {},
) => {
  const { query, isReady, replace } = useRouter();

  const [value, setValue] = useState(defaultValue);

  const queryValue = query[name] as string;

  const [isDoneSettingFromQuery, setIsDoneSettingFromQuery] = useState(false);
  useEffectOnceWhen(() => {
    const newValue = parse<T>(query[name] as string);
    if (typeof defaultValue === 'object' || typeof newValue === 'object') {
      setValue((value) => ({ ...value, ...newValue }));
    } else {
      setValue(newValue);
    }
    setIsDoneSettingFromQuery(true);
  }, isReady);

  const [isPending, startTransition] = useTransition();

  const setQueryParam = useCallback(
    (value: T) => {
      if (!isReady) return;
      if (!value) {
        // delete the old value from the query params
        if (queryValue) {
          const { [name]: _currentValue, ...restQuery } = query;
          replace({ query: restQuery }, undefined, { shallow: true });
        }
        return;
      }

      replace({
        query: {
          ...query,
          [name]: serialize(formatParam ? formatParam(value) : value),
        },
      });
    },
    [formatParam, isReady, name, query, queryValue, replace],
  );

  const setDebouncedQueryParam = useDebounce(setQueryParam, 500);

  const setParam = useCallback(
    (value: T) => {
      if (!isDoneSettingFromQuery) return;
      setValue(value);
      if (!isPending) {
        startTransition(() => {
          setDebouncedQueryParam(value);
        });
      }
    },
    [isDoneSettingFromQuery, isPending, setDebouncedQueryParam],
  );

  return [value, setParam, isDoneSettingFromQuery] as const;
};

export default useQueryParam;
