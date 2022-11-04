import { useRouter } from 'next/router';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useDebounce, useEffectOnceWhen } from 'rooks';

import type { Dispatch } from 'react';

interface UseQueryParamOptions<T, F = T> {
  /**
   * Format the param before it's JSON.stringified
   * Useful to store less information in the query params
   * and avoid clutter
   */
  formatParam?: (value: T) => F;
  waitTimeMs?: number;
  pushInsteadOfReplace?: boolean;
  onChange?: Dispatch<T>;
  defaultValue?: T | (() => T);
}

const serialize = <T>(value: T): string => {
  if (value === undefined) return undefined;

  return JSON.stringify(value);
};

const parse = <T>(value: string): T => {
  if (!value === undefined) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return value as T;
  }
};

const window = typeof global.window === 'undefined' ? null : global.window;

const useQueryParam = <T, F = T>(
  name: string,
  {
    defaultValue,
    formatParam,
    waitTimeMs = 100,
    pushInsteadOfReplace = false,
    onChange,
  }: UseQueryParamOptions<T, F> = {},
) => {
  const router = useRouter();

  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (!router.isReady) return;
    onChange?.(value);
  }, [onChange, router.isReady, value]);

  const queryValue = router.query[name] as string;

  const [isDoneSettingInitialState, setIsDoneSettingInitialState] = useState(false);
  useEffectOnceWhen(() => {
    const newValue = parse<T>(router.query[name] as string);

    if (newValue) {
      if (!value || typeof value !== 'object' || typeof newValue !== 'object') {
        setValue(newValue);
      } else {
        setValue((value) => ({ ...value, ...newValue }));
      }
    }

    setIsDoneSettingInitialState(true);
  }, router.isReady);

  const [isPending, startTransition] = useTransition();

  const setQueryParam = useCallback(
    (value: T) => {
      const queryParams = router.query;

      if (!value && queryValue) {
        delete queryParams[name];
      } else {
        queryParams[name] = serialize(formatParam ? formatParam(value) : value);
      }
      if (!isPending)
        startTransition(() => {
          (pushInsteadOfReplace ? router.push : router.replace)({ query: queryParams }, undefined, {
            shallow: true,
          });
        });
    },
    [
      formatParam,
      isPending,
      name,
      pushInsteadOfReplace,
      queryValue,
      router.push,
      router.query,
      router.replace,
    ],
  );

  const setDebouncedQueryParam = useDebounce(setQueryParam, waitTimeMs);

  useEffect(() => {
    const handleParam = (href: string) => {
      const url = new URL(`${window.location.host}${href}`);
      const newQueryStr = Object.fromEntries(url.searchParams.entries())[name];

      const value = parse<T>(newQueryStr);

      setValue(value);
    };
    router.events.on('beforeHistoryChange', handleParam);

    return () => {
      router.events.off('beforeHistoryChange', handleParam);
    };
  }, [name, queryValue, router.events, setDebouncedQueryParam, setQueryParam]);

  const setParam = useCallback(
    (value: T) => {
      if (!isDoneSettingInitialState) return;
      setValue(value);
      if (!isPending) {
        setDebouncedQueryParam(value);
      }
    },
    [isDoneSettingInitialState, isPending, setDebouncedQueryParam],
  );

  return [value, setParam, isDoneSettingInitialState] as const;
};

export default useQueryParam;
