import ImpactIndicatorsFilter from './impact-indicators';
import GroupByFilter from './group-by';
import YearsFilter from './years';

const AnalysisFilters: React.FC = () => (
  <div className="absolute left-12 top-6 z-10 inline-flex gap-2">
    <ImpactIndicatorsFilter />
    <GroupByFilter />
    <YearsFilter />
  </div>
);

export default AnalysisFilters;