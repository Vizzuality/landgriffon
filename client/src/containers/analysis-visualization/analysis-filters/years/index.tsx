import { useQuery } from 'react-query';

import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';
import { getYears } from 'services/years';
import Component from './component';

const YearsFilter: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysis);
  const response = useQuery('yearsList', getYears);

  const result = response.isSuccess && response.data && response;

  const isRange = visualizationMode !== 'map';

  return <Component years={result} isRange={isRange} />;
};

export default YearsFilter;
