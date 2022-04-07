import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';

import IndicatorsFilter from './indicators';
import GroupByFilter from './group-by';
import YearsFilter from './years';
import YearsRangeFilter from './years-range';
import MoreFilters from './more-filters';

const AnalysisFilters: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);

  return (
    <div className="inline-flex gap-2 flex-wrap">
      <IndicatorsFilter />
      {visualizationMode !== 'map' && <GroupByFilter />}
      {visualizationMode === 'map' && <YearsFilter />}
      {visualizationMode !== 'map' && <YearsRangeFilter />}
      <MoreFilters />
    </div>
  );
};

export default AnalysisFilters;
