import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
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
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

const parse = <T>(value: string): T => {
  if (value === undefined) return undefined;

  try {
    return JSON.parse(value);
  } catch {
    return value as T;
  }
};

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

  const setQueryParam = useCallback(
    async (value: T) => {
      const queryParams = router.query;

      if (!value) {
        delete queryParams[name];
      } else {
        queryParams[name] = serialize(formatParam ? formatParam(value) : value);
      }
      await (pushInsteadOfReplace ? router.push : router.replace)(
        { query: queryParams },
        undefined,
        {
          shallow: true,
        },
      );
    },
    [formatParam, name, pushInsteadOfReplace, router.push, router.query, router.replace],
  );

  const setDebouncedQueryParam = useDebounce(setQueryParam, waitTimeMs);

  useEffect(() => {
    const handleParam = (href: string) => {
      const params = new URLSearchParams(href.split('?')[1]);
      const value = parse<T>(params.get(name) || undefined);

      setValue(value);
    };
    router.events.on('beforeHistoryChange', handleParam);

    return () => {
      router.events.off('beforeHistoryChange', handleParam);
    };
  }, [name, queryValue, router.events, setDebouncedQueryParam, setQueryParam]);

  const setParam = useCallback(
    async (value: T) => {
      if (!isDoneSettingInitialState) return;
      setValue(value);
      onChange?.(value);
      await setDebouncedQueryParam(value);
    },
    [isDoneSettingInitialState, onChange, setDebouncedQueryParam],
  );

  return [value, setParam, isDoneSettingInitialState] as const;
};

export default useQueryParam;
