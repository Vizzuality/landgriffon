import { createSelector } from '@reduxjs/toolkit';
import { analysisFilters } from './filters';

import type { AnalysisFiltersState } from './filters';
import type { ImpactTabularAPIParams } from 'types';

export const filtersForTabularAPI = createSelector(
  [analysisFilters],
  ({
    layer,
    startYear,
    endYear,
    by,
    indicator,
    materials,
    suppliers,
    origins,
    locationTypes,
  }: AnalysisFiltersState): ImpactTabularAPIParams => {
    if (layer === 'impact') {
      return {
        startYear,
        endYear,
        groupBy: by,
        indicatorId: indicator?.value,
        materialIds: materials?.map(({ value }) => value),
        supplierIds: suppliers?.map(({ value }) => value),
        originIds: origins?.map(({ value }) => value),
        locationTypes: locationTypes?.map(({ value }) => value),
      };
    }

    return null;
  },
);
