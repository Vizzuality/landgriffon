import { createSelector } from '@reduxjs/toolkit';
import { analysisFilters } from './filters';

import type { AnalysisFiltersState } from './filters';
import type {
  MaterialH3APIParams,
  RiskH3APIParams,
  ImpactH3APIParams,
  ImpactTabularAPIParams,
} from 'types';

export const filtersForH3API = createSelector(
  [analysisFilters],
  (analysisFiltersState: AnalysisFiltersState) => {
    const { layer, startYear, materials, indicator, suppliers, origins } = analysisFiltersState;

    if (layer === 'material') {
      const result: MaterialH3APIParams = {
        year: startYear,
        materialId: materials && materials.length && materials[0].value,
        resolution: 4,
      };
      return result;
    }

    if (layer === 'risk') {
      const result: RiskH3APIParams = {
        year: startYear,
        indicatorId: indicator?.value,
        materialId: materials && materials.length && materials[0].value,
        resolution: 4,
      };
      return result;
    }

    // when layer is impact
    const result: ImpactH3APIParams = {
      year: startYear,
      indicatorId: indicator?.value,
      ...(materials && materials.length
        ? { materialIds: materials?.map(({ value }) => value) }
        : {}),
      ...(suppliers && suppliers.length
        ? { supplierIds: suppliers?.map(({ value }) => value) }
        : {}),
      ...(origins && origins.length ? { originIds: origins?.map(({ value }) => value) } : {}),
      resolution: 4,
    };

    return result;
  },
);

export const filtersForTabularAPI = createSelector(
  [analysisFilters],
  (analysisFiltersState: AnalysisFiltersState): ImpactTabularAPIParams => {
    const { layer, startYear, endYear, by, indicator, materials, suppliers, origins } =
      analysisFiltersState;

    if (layer === 'impact') {
      const result: ImpactTabularAPIParams = {
        startYear: startYear,
        endYear: endYear,
        groupBy: by,
        indicatorId: indicator?.value,
        materialIds: materials?.map(({ value }) => value),
        supplierIds: suppliers?.map(({ value }) => value),
        originIds: origins?.map(({ value }) => value),
      };
      return result;
    }

    return null;
  },
);
