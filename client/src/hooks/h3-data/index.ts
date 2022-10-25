import { useMemo } from 'react';

import useH3MaterialData from './material';
import useH3ImpactData from './impact';
import useH3ContextualData from './contextual';
import { storeToQueryParams } from './utils';

import { useAppSelector } from 'store/hooks';
import { analysisFilters, scenarios } from 'store/features/analysis';

import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  H3APIResponse,
  MaterialH3APIParams,
  ImpactH3APIParams,
  Layer,
  ContextualH3APIParams,
  ErrorResponse,
} from 'types';

interface UseH3DataProps<T> {
  id: Layer['id'];
  params?: Partial<MaterialH3APIParams & ImpactH3APIParams>;
  options?: UseQueryOptions<
    H3APIResponse,
    ErrorResponse,
    T
    // ['h3-data-contextual', string, ContextualH3APIParams]
  >;
}

export const useH3Data = <T = H3APIResponse>({
  id,
  params: { materialId, year } = {},
  options: { enabled = true, ...options } = {},
}: UseH3DataProps<T>) => {
  const isContextual = !['impact', 'material'].includes(id);
  const isMaterial = id === 'material';
  const isImpact = id === 'impact';

  const filters = useAppSelector(analysisFilters);
  const { currentScenario, scenarioToCompare, isComparisonEnabled } = useAppSelector(scenarios);

  const impactParams = useMemo(
    () =>
      storeToQueryParams({
        ...filters,
        currentScenario,
        scenarioToCompare,
        isComparisonEnabled,
        materialId,
        startYear: year,
      }),
    [currentScenario, filters, isComparisonEnabled, materialId, scenarioToCompare, year],
  );

  const materialParams = useMemo(() => ({ materialId, year }), [materialId, year]);
  const materialOptions = useMemo(
    () => ({ ...options, enabled: enabled && isMaterial }),
    [enabled, isMaterial, options],
  );
  const materialQuery = useH3MaterialData(materialParams, materialOptions);

  const impactOptions = useMemo(
    () => ({ ...options, enabled: enabled && isImpact }),
    [enabled, isImpact, options],
  );
  const impactQuery = useH3ImpactData(impactParams, impactOptions);

  const contextualOptions = useMemo(
    () => ({
      ...(options as UseQueryOptions<
        H3APIResponse,
        ErrorResponse,
        T,
        ['h3-data-contextual', string, ContextualH3APIParams]
      >),
      enabled: enabled && isContextual,
    }),
    [enabled, isContextual, options],
  );
  const contextualQuery = useH3ContextualData(id, contextualOptions);

  if (isImpact) return impactQuery;
  if (isMaterial) return materialQuery;
  return contextualQuery;
};
