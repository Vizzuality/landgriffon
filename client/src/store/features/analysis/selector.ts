import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'store';
import type { AnalysisState } from './index';
import type {
  MaterialH3APIParams,
  RiskH3APIParams,
  ImpactH3APIParams,
  ImpactTabularAPIParams,
} from 'types';

const analysis = (state: RootState) => state.analysis;

export const filtersForH3API = createSelector([analysis], (analysisState: AnalysisState) => {
  const { layer, filters } = analysisState;

  if (layer === 'material') {
    const result: MaterialH3APIParams = {
      year: filters.startYear,
      materialId: filters.materials && filters.materials.length && filters.materials[0].value,
      resolution: 4,
    };
    return result;
  }

  if (layer === 'risk') {
    const result: RiskH3APIParams = {
      year: filters.startYear,
      indicatorId: filters.indicator?.value,
      materialId: filters.materials && filters.materials.length && filters.materials[0].value,
      resolution: 4,
    };
    return result;
  }

  // when layer is impact
  const result: ImpactH3APIParams = {
    year: filters.startYear,
    indicatorId: filters.indicator?.value,
    ...(filters.materials && filters.materials.length
      ? { materialIds: filters.materials?.map(({ value }) => value) }
      : {}),
    ...(filters.suppliers && filters.suppliers.length
      ? { supplierIds: filters.suppliers?.map(({ value }) => value) }
      : {}),
    ...(filters.origins && filters.origins.length
      ? { originIds: filters.origins?.map(({ value }) => value) }
      : {}),
    resolution: 4,
  };

  return result;
});

export const filtersForTabularAPI = createSelector(
  [analysis],
  (analysisState: AnalysisState): ImpactTabularAPIParams => {
    const { layer, filters } = analysisState;

    if (layer === 'impact') {
      const result: ImpactTabularAPIParams = {
        startYear: filters.startYear,
        endYear: filters.endYear,
        groupBy: filters.by,
        indicatorId: filters.indicator?.value,
        materialIds: filters.materials?.map(({ value }) => value),
        supplierIds: filters.suppliers?.map(({ value }) => value),
        originIds: filters.origins?.map(({ value }) => value),
      };
      return result;
    }

    return null;
  },
);
