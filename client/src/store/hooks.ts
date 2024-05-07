import { useDispatch, useSelector } from 'react-redux';
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';

import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '.';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// https://redux.js.org/recipes/usage-with-typescript#define-typed-hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useSyncIndicators = () => {
  return useQueryState('indicators', parseAsArrayOf(parseAsString));
};

export const useSyncTableDetailView = () => {
  return useQueryState('detail', parseAsString);
};
