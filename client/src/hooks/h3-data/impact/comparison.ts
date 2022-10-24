import { useQuery } from '@tanstack/react-query';

import { DEFAULT_QUERY_OPTIONS, responseParser } from '../utils';

import { apiRawService } from 'services/api';
import { COLOR_RAMPS, useColors } from 'utils/colors';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { Scenario } from 'containers/scenarios/types';
import type { ImpactH3APIParams } from 'types';
import type { H3ImpactResponse } from '../utils';

interface CompareH3ApiParams extends ImpactH3APIParams {
  comparedScenarioId: Scenario['id'];
  relative: boolean;
  baseScenarioId: Scenario['id'];
}

const useH3ComparisonData = <T = H3ImpactResponse>(
  { baseScenarioId, ...rawParams }: CompareH3ApiParams,
  options: UseQueryOptions<H3ImpactResponse, unknown, T>,
) => {
  const vsActual = !baseScenarioId;
  const colors = useColors('compare', COLOR_RAMPS);
  const params = { ...rawParams, ...(vsActual ? {} : { baseScenarioId }) };

  const url = `/h3/map/impact/compare/${vsActual ? 'actual' : 'scenario'}/vs/scenario`;
  const enabled = (options.enabled ?? true) && !!(params.indicatorId && params.year);

  const query = useQuery(
    ['h3-data-impact', 'comparison', params],
    () =>
      apiRawService
        .get<H3ImpactResponse>(url, {
          params,
        })
        .then((response) => response.data)
        // Adding color to the response
        .then((response) => responseParser(response, colors)),
    { ...DEFAULT_QUERY_OPTIONS, ...options, enabled },
  );

  return query;
};

export default useH3ComparisonData;
