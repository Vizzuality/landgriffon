import ImpactIndicatorsFilter from './impact-indicators';
import GroupByFilter from './group-by';
import YearsFilter from './years';
import MoreFilters from './more-filters';
import Materials from './materials';
import OriginRegions from './origin-regions';
import Suppliers from './suppliers';

const FILTERS = [
  <Materials key="materialsFilter" />,
  <OriginRegions key="originRegionsFilter" />,
  <Suppliers key="suppliersFilter" />,
];

const AnalysisFilters: React.FC = () => (
  <div className="inline-flex gap-2">
    <ImpactIndicatorsFilter />
    <GroupByFilter />
    <YearsFilter />
    <MoreFilters filters={FILTERS} />
  </div>
);

export default AnalysisFilters;
