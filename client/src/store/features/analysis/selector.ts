import { createSelector } from '@reduxjs/toolkit';
import { analysisFilters } from './filters';
import { analysisMap, AnalysisMapState } from './map';

import type { AnalysisFiltersState } from './filters';
import type {
  MaterialH3APIParams,
  RiskH3APIParams,
  ImpactH3APIParams,
  ImpactTabularAPIParams,
} from 'types';

export const filtersForH3API = createSelector(
  [analysisFilters, analysisMap],
  (analysisFiltersState: AnalysisFiltersState, analysisMapState: AnalysisMapState) => {
    const { layers } = analysisMapState;
    const { startYear, materials, indicator, suppliers, origins } = analysisFiltersState;

    if (layers.material.active) {
      const result: MaterialH3APIParams = {
        year: startYear,
        materialId: layers.material.material && layers.material.material.value,
        resolution: 4,
      };
      return result;
    }

    if (layers.risk.active) {
      const result: RiskH3APIParams = {
        year: startYear,
        indicatorId: indicator?.value,
        materialId: layers.material.material && layers.material.material.value,
        resolution: 4,
      };
      return result;
    }

    // when layer is impact
    const result: ImpactH3APIParams = {
      year: startYear,
      indicatorId: indicator?.value && indicator?.value !== 'all' ? indicator?.value : null,
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
