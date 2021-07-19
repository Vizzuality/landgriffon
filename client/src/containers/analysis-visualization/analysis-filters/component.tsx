import ImpactIndicators from './impact-indicators'
import GroupBy from './group-by'

const AnalysisFilters: React.FC = () =>  {
  return (
    <div className="absolute left-12 top-6 z-10 inline-flex gap-2">
      <ImpactIndicators />
      <GroupBy />
    </div>
  );
}

export default AnalysisFilters;
