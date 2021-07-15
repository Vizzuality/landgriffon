import { useQuery } from 'react-query';
import { getScenarios } from 'services/scenarios';
import Component from './component';
import type { Scenario } from './types';

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: 'actual-data', // reserved id only for actual-data
  title: 'Actual data',
};

const ScenariosContainer: React.FC = () => {
  const response = useQuery('scenariosList', getScenarios);
  const result =
    response.isSuccess && response.data
      ? {
          ...response,
          // injecting actual data
          data: [ACTUAL_DATA, ...response.data],
        }
      : response;

  return <Component scenarios={result} />;
};

export default ScenariosContainer;
