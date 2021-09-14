import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import ImpactIndicatorsFilter from './impact-indicators';
import GroupByFilter from './group-by';
import YearsFilter from './years';
import Materials from './materials';
import MoreFilters from './more-filters';

const AnalysisFilters: React.FC = () => {
  const { layer } = useAppSelector(analysis);

  return (
    <div className="inline-flex gap-2 flex-wrap">
      {layer !== 'crop' && <ImpactIndicatorsFilter />}
      {layer !== 'impact' && <Materials />}
      {layer === 'impact' && <GroupByFilter />}
      <YearsFilter />
      {layer === 'impact' && <MoreFilters />}
    </div>
  );
};

export default AnalysisFilters;
