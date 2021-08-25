import { useQuery } from 'react-query';

import { getOriginRegions } from 'services/origin-regions';
import Component from './component';

const OriginRegionsContainer: React.FC = () => {
  const response = useQuery('originRegionsList', getOriginRegions);

  // const result = response.isSuccess && response.data && response;

  // // TODO: remove
  // if (response.isSuccess && response.data) {
  //   result.data = [
  //     {
  //       id: '0',
  //       name: 'Brazil',
  //     },
  //     {
  //       id: '1',
  //       name: 'Canada',
  //     },
  //   ];
  // }

  return <Component originRegions={response} />;
};

export default OriginRegionsContainer;
