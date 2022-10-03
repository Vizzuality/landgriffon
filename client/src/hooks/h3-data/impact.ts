import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { ACTUAL_DATA } from 'containers/scenarios/constants';
import { apiRawService } from 'services/api';
import { analysisFilters, scenarios } from 'store/features/analysis';
import { useAppSelector } from 'store/hooks';
import type { H3APIResponse, ImpactH3APIParams } from 'types';
import { useColors, COLOR_RAMPS } from 'utils/colors';
import type { H3ImpactResponse } from './utils';
import { DEFAULT_QUERY_OPTIONS, responseParser } from './utils';

const useH3ImpactData = <T = H3ImpactResponse>(
  params: Partial<ImpactH3APIParams> = {},
  options: Partial<UseQueryOptions<H3ImpactResponse, unknown, T>> = {},
) => {
  const { startYear, materials, indicator, suppliers, origins, locationTypes } =
    useAppSelector(analysisFilters);
  const { currentScenario } = useAppSelector(scenarios);

  const colors = useColors('impact', COLOR_RAMPS);
  const urlParams: ImpactH3APIParams = {
    year: startYear,
    indicatorId: indicator?.value && indicator?.value === 'all' ? null : indicator?.value,
    ...(materials?.length ? { materialIds: materials?.map(({ value }) => value) } : {}),
    ...(suppliers?.length ? { supplierIds: suppliers?.map(({ value }) => value) } : {}),
    ...(origins?.length ? { originIds: origins?.map(({ value }) => value) } : {}),
    ...(locationTypes?.length ? { locationTypes: locationTypes?.map(({ value }) => value) } : {}),
    ...(currentScenario !== ACTUAL_DATA.id ? { scenarioId: currentScenario } : {}),
    ...params,
    resolution: origins?.length ? 6 : 4,
  };

  const isEnable = (options.enabled ?? true) && !!(urlParams.indicatorId && urlParams.year);

  const query = useQuery(
    ['h3-data-impact', urlParams],
    () =>
      apiRawService
        .get<H3APIResponse>('/h3/map/impact', {
          params: urlParams,
        })
        .then((response) => response.data)
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    {
      ...DEFAULT_QUERY_OPTIONS,
      enabled: isEnable,
      ...options,
    },
  );

  return query;
};

export default useH3ImpactData;
