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
  waitTimeMs?: number;
  pushInsteadOfReplace?: boolean;
}

const serialize = <T>(value: T): string => {
  if (value === undefined) return undefined;

  return JSON.stringify(value);
};

const parse = <T>(value: string): T => {
  if (value === undefined) return undefined;

  return JSON.parse(value);
};

const window = typeof global.window === 'undefined' ? null : global.window;

const updateQueryParams = (params: URLSearchParams, push: boolean) => {
  if (push) {
    window.history.pushState?.(null, null, `?${params}`);
  } else {
    window.history.replaceState?.(null, null, `?${params}`);
  }
};

const useQueryParam = <T, F = T>(
  name: string,
  defaultValue?: T | (() => T),
  { formatParam, waitTimeMs = 100, pushInsteadOfReplace = false }: UseQueryParamOptions<T, F> = {},
) => {
  const { query, isReady } = useRouter();

  const [value, setValue] = useState(defaultValue);

  const queryValue = query[name] as string;

  const [isDoneSettingInitialState, setIsDoneSettingInitialState] = useState(false);
  useEffectOnceWhen(() => {
    const newValue = parse<T>(query[name] as string);
    if (typeof defaultValue === 'object' || typeof newValue === 'object') {
      setValue((value) => ({ ...value, ...newValue }));
    } else {
      setValue(newValue);
    }
    setIsDoneSettingInitialState(true);
  }, isReady);

  const [isPending, startTransition] = useTransition();

  const setQueryParam = useCallback(
    (value: T) => {
      const currentURL = new URL(window.location.href);
      const queryParams = currentURL.searchParams;

      if (!value && queryValue) {
        queryParams.delete(name);
        return updateQueryParams(queryParams, pushInsteadOfReplace);
      }

      queryParams.set(name, serialize(formatParam ? formatParam(value) : value));
      return updateQueryParams(queryParams, pushInsteadOfReplace);
    },
    [formatParam, name, pushInsteadOfReplace, queryValue],
  );

  const setDebouncedQueryParam = useDebounce(setQueryParam, waitTimeMs);

  const setParam = useCallback(
    (value: T) => {
      if (!isDoneSettingInitialState) return;
      setValue(value);
      if (!isPending) {
        startTransition(() => {
          setDebouncedQueryParam(value);
        });
      }
    },
    [isDoneSettingInitialState, isPending, setDebouncedQueryParam],
  );

  return [value, setParam, isDoneSettingInitialState] as const;
};

export default useQueryParam;
