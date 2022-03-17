import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import { analysisFilters } from 'store/features/analysis/filters';

import IndicatorsFilter from './indicators';
import GroupByFilter from './group-by';
import YearsFilter from './years';
import Materials from './materials';
import MoreFilters from './more-filters';

const AnalysisFilters: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const { layer } = useAppSelector(analysisFilters);

  return (
    <div className="inline-flex gap-2 flex-wrap">
      {layer !== 'material' && <IndicatorsFilter />}
      {layer !== 'impact' && <Materials />}
      {layer === 'impact' && visualizationMode !== 'map' && <GroupByFilter />}
      <YearsFilter />
      {layer === 'impact' && <MoreFilters />}
    </div>
  );
};

export default AnalysisFilters;
