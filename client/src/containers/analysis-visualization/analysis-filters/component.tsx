import ImpactIndicatorsFilter from './impact-indicators';
import GroupByFilter from './group-by';
import YearsFilter from './years';
import MoreFilters from './more-filters';
import Materials from './materials';
import OriginRegions from './origin-regions';
import Suppliers from './suppliers';

const FILTERS = [<Materials />, <OriginRegions />, <Suppliers />];

const AnalysisFilters: React.FC = () => (
  <div className="absolute left-12 top-6 z-10 inline-flex gap-2">
    <ImpactIndicatorsFilter />
    <GroupByFilter />
    <YearsFilter />
    <MoreFilters filters={FILTERS} />
  </div>
);

export default AnalysisFilters;
