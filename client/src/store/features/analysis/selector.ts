import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { AnalysisState } from './index';

const filters = (state: RootState) => state.analysis.filters;

export const filtersForAPI = createSelector(
  [filters],
  (filtersState: AnalysisState['filters']) => ({
    indicatorId: filtersState.indicator?.value,
    groupBy: filtersState.by,
    materialIds: filtersState.materials?.map(({ value }) => value),
    supplierIds: filtersState.suppliers?.map(({ value }) => value),
    originIds: filtersState.origins?.map(({ value }) => value),
    year: filtersState.startYear,
  }),
);
