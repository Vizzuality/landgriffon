import IndicatorsFilter from './indicators';
import GroupByFilter from './group-by';
import YearsFilter from './years';
import YearsRangeFilter from './years-range';
import MoreFilters from './more-filters';

import { analysisUI } from 'store/features/analysis/ui';
import { useAppSelector } from 'store/hooks';

const AnalysisFilters: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);

  return (
    <div className="inline-flex flex-wrap gap-2">
      <IndicatorsFilter />
      {visualizationMode !== 'map' && <GroupByFilter />}
      {visualizationMode === 'map' && <YearsFilter />}
      {visualizationMode !== 'map' && <YearsRangeFilter />}
      <MoreFilters />
    </div>
  );
};

export default AnalysisFilters;
