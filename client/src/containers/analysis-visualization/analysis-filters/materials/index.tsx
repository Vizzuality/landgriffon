import { useQuery } from 'react-query';

import { getMaterialsTrees } from 'services/materials';
import Component from './component';

const MaterialsFilter: React.FC = () => {
  const response = useQuery('materialsTreesList', getMaterialsTrees);

  return <Component materials={response} />;
};

export default MaterialsFilter;
