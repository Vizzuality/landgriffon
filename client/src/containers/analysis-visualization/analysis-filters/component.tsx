import ImpactIndicators from './impact-indicators'
import GroupBy from './group-by'
import Years from './years'

const AnalysisFilters: React.FC = () =>  {
  return (
    <div className="absolute left-12 top-6 z-10 inline-flex gap-2">
      <ImpactIndicators />
      <GroupBy />
      <Years />
    </div>
  );
}

export default AnalysisFilters;
