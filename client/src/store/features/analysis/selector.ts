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
    businessUnits,
    t1Suppliers,
    producers,
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
        t1SupplierIds: t1Suppliers?.map(({ value }) => value),
        producerIds: producers?.map(({ value }) => value),
        originIds: origins?.map(({ value }) => value),
        locationTypes: locationTypes?.map(({ value }) => value),
        businessUnitIds: businessUnits?.map(({ value }) => value),
      };
    }

    return null;
  },
);
