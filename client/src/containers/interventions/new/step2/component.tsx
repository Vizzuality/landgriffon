import { FC } from 'react';

import { useAppSelector } from 'store/hooks';

import Material from './material';
import Supplier from './supplier';
import SupplierImpact from './supplier-impact';

import { analysis } from 'store/features/analysis';

const Step2: FC = () => {
  const { filters } = useAppSelector(analysis);
  const { interventionType } = filters;

  return (
    <>
      {interventionType === 'new-supplier-location' && <Material />}
      {(interventionType === 'new-supplier-location' || interventionType === 'new-material') && (
        <Supplier />
      )}
      <SupplierImpact />
    </>
  );
};

export default Step2;
