import { useQuery } from 'react-query';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';
import { getIndicators } from 'services/indicators';
import type { Indicator } from 'types';
import Component from './component';

const ALL_INDICATORS: Indicator = {
  id: 'all',
  name: 'All indicators',
};

const AnalysisFilterContainer: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysis);
  const response = useQuery('indicatorsList', getIndicators);

  const result =
    response.isSuccess && response.data && visualizationMode !== 'map'
      ? {
          ...response,
          // injecting actual data
          data: [ALL_INDICATORS, ...response.data],
        }
      : response;

  return <Component indicators={result} />;
};

export default AnalysisFilterContainer;
