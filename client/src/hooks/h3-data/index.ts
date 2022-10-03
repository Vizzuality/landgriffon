import { useMemo } from 'react';
import useH3MaterialData from './material';
import useH3ImpactData from './impact';
import useH3ContextualData from './contextual';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { H3APIResponse } from 'types';
import type { MaterialH3APIParams, ImpactH3APIParams, Layer } from 'types';

interface UseH3DataProps<T> {
  id: Layer['id'];
  params?: Partial<MaterialH3APIParams & ImpactH3APIParams>;
  options?: UseQueryOptions<H3APIResponse, unknown, T>;
}

export const useH3Data = <T = H3APIResponse>({
  id,
  params: { materialId, year } = {},
  options: { enabled = true, ...options } = {},
}: UseH3DataProps<T>) => {
  const isContextual = !['impact', 'material'].includes(id);
  const isMaterial = id === 'material';
  const isImpact = id === 'impact';

  const materialParams = useMemo(() => ({ materialId }), [materialId]);
  const materialOptions = useMemo(
    () => ({ ...options, enabled: enabled && isMaterial }),
    [enabled, isMaterial, options],
  );
  const materialQuery = useH3MaterialData(materialParams, materialOptions);

  const impactParams = useMemo(() => ({ year }), [year]);
  const impactOptions = useMemo(
    () => ({ ...options, enabled: enabled && isImpact }),
    [enabled, isImpact, options],
  );
  const impactQuery = useH3ImpactData(impactParams, impactOptions);

  const contextualOptions = useMemo(
    () => ({ ...options, enabled: enabled && isContextual }),
    [enabled, isContextual, options],
  );
  const contextualQuery = useH3ContextualData(id, contextualOptions);

  if (isImpact) return impactQuery;
  if (isMaterial) return materialQuery;
  return contextualQuery;
};
