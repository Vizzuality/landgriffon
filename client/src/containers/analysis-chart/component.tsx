import { useStore } from 'react-redux';
import omit from 'lodash/omit';

import { filtersForTabularAPI } from 'store/features/analysis/selector';
import { useImpactRanking } from 'hooks/impact';

import Loading from 'components/loading';
import ImpactChart from './impact-chart';

import type { Store } from 'store';
import type { Indicator } from 'types';

type AnalysisChartProps = {
  indicator: Indicator;
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ indicator }) => {
  const store: Store = useStore();
  const filters = filtersForTabularAPI(store.getState());

  const params = {
    maxRankingEntities: 5,
    sort: 'DES',
    ...omit(filters, 'indicatorId'),
    indicatorIds: [indicator.id],
  };

  const enabled =
    !!filters?.indicatorId &&
    !!filters.startYear &&
    !!filters.endYear &&
    filters.endYear !== filters.startYear;

  const { data, isFetched, isLoading } = useImpactRanking(
    {
      maxRankingEntities: 5,
      sort: 'DES',
      ...params,
    },
    {
      enabled,
    },
  );

  return (
    <div className="p-6 bg-white rounded-md shadow-sm">
      {isLoading && <Loading className="w-5 h-5 m-auto text-primary" />}
      {!isLoading && isFetched && data && <ImpactChart data={data} />}
    </div>
  );
};

export default AnalysisChart;
