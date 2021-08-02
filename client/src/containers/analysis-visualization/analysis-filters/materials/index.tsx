import { useQuery } from 'react-query';

import { getMaterialsTrees } from 'services/materials';
import Component from './component';

const MaterialsFilter: React.FC = () => {
  const response = useQuery('materialsTreesList', getMaterialsTrees);

  // if (response.isSuccess && response.data) return null;
  const result = response.isSuccess && response.data && response;

  // TODO: remove
  if (response.isSuccess && response.data) {
    result.data = [
      {
        id: '0',
        name: 'Beef',
      },
      {
        id: '1',
        name: 'Cocoa',
        children: [
          {
            id: '1-0',
            name: 'Cocoa Beans',
          },
          {
            id: '1-1',
            name: 'Cocoa Butter',
          },
        ],
      },
    ];
  }

  return <Component materials={result} />;
};

export default MaterialsFilter;
