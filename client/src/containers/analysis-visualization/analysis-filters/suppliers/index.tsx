import { useQuery } from 'react-query';

import { getSuppliersTrees } from 'services/suppliers';
import Component from './component';

const SuppliersFilter: React.FC = () => {
  const response = useQuery('suppliersTreesList', getSuppliersTrees);

  return <Component suppliers={response} />;
};

export default SuppliersFilter;
