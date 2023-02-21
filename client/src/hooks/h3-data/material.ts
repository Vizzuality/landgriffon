import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { DEFAULT_QUERY_OPTIONS, responseParser } from './utils';

import { apiRawService } from 'services/api';
import { analysisFilters } from 'store/features/analysis';
import { useAppSelector } from 'store/hooks';
import { COLOR_RAMPS, useColors } from 'utils/colors';
import { useYears } from 'hooks/years';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { H3APIResponse, MaterialH3APIParams } from 'types';

const useH3MaterialData = <T = H3APIResponse>(
  params: Partial<MaterialH3APIParams> = {},
  options: Partial<UseQueryOptions<H3APIResponse, AxiosError, T>> = {},
) => {
  const colors = useColors('material', COLOR_RAMPS);
  const filters = useAppSelector(analysisFilters);
  const { materialId } = filters;

  const { data: year } = useYears('material', [materialId], null, {
    enabled: !!materialId,
    select: (years) => years?.[years?.length - 1],
  });

  const urlParams = useMemo(
    () => ({
      materialId,
      resolution: 4,
      year,
      ...params,
    }),
    [materialId, params, year],
  );

  const enabled = (options.enabled ?? true) && !!urlParams.year && !!urlParams.materialId;

  const fetchMaterialData = useCallback(
    () =>
      apiRawService
        .get<H3APIResponse>('/h3/map/material', {
          params: urlParams,
        })
        // Adding color to the response
        .then((response) => response.data)
        .then((response) => responseParser(response, colors)),
    [colors, urlParams],
  );

  const query = useQuery(['h3-data-material', urlParams], fetchMaterialData, {
    ...DEFAULT_QUERY_OPTIONS,
    ...options,
    enabled,
  });

  return query;
};

export default useH3MaterialData;
