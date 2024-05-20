import IndicatorsFilter from './indicators';
import IndicatorsMapFilter from './indicators/map';
import GroupByFilter from './group-by';
import YearsRangeFilter from './years-range';
import MoreFilters from './more-filters';

import YearsFilter from 'containers/years';
import { analysisUI } from 'store/features/analysis/ui';
import { useAppSelector } from 'store/hooks';

const AnalysisFilters: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);

  return (
    <div className="inline-flex flex-wrap gap-2">
      {visualizationMode === 'map' && (
        <>
          <IndicatorsMapFilter />
          <YearsFilter />
        </>
      )}
      {visualizationMode !== 'map' && (
        <>
          <IndicatorsFilter />
          <GroupByFilter />
          <YearsRangeFilter />
        </>
      )}
      <MoreFilters />
    </div>
  );
};

export default AnalysisFilters;
