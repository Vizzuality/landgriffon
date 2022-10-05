import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Scenario } from 'containers/scenarios/types';
import { apiRawService } from 'services/api';
import type { ImpactH3APIParams } from 'types';
import { COLOR_RAMPS, useColors } from 'utils/colors';
import type { H3ImpactResponse } from '../utils';
import { DEFAULT_QUERY_OPTIONS } from '../utils';
import { responseParser } from '../utils';

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
  const colors = useColors('impact', COLOR_RAMPS);
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
