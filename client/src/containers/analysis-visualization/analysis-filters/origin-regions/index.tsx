import { useQuery } from 'react-query';

import { getOriginRegions } from 'services/origin-regions';
import Component from './component';

const OriginRegionsContainer: React.FC = () => {
  const response = useQuery('originRegionsList', getOriginRegions);

  return <Component originRegions={response} />;
};

export default OriginRegionsContainer;
