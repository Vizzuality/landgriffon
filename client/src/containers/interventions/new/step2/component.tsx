import { FC } from 'react';

import { useAppSelector } from 'store/hooks';

import Material from './material';
import Supplier from './supplier';
import SupplierImpact from './supplier-impact';

import { analysisFilters } from 'store/features/analysis/filters';

const Step2: FC = ({ register }) => {
  const filters = useAppSelector(analysisFilters);
  const { interventionType } = filters;

  return (
    <>
      {interventionType === 'new-supplier-location' && <Material register={register} />}
      {(interventionType === 'new-supplier-location' || interventionType === 'new-material') && (
        <Supplier register={register} />
      )}
      <SupplierImpact register={register} />
    </>
  );
};

export default Step2;
