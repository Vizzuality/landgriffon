import { FC } from 'react';
import { useAppSelector } from 'store/hooks';

import Material from './material';
import Supplier from './supplier';
import SupplierImpact from './supplier-impact';

import { analysis } from 'store/features/analysis';

// types
import { useInterventionType } from 'hooks/scenarios';

const Step2: FC = () => {
  const { filters } = useAppSelector(analysis);
  const { interventionType } = filters;

  const intervention = useInterventionType(interventionType);

  return (
    <>
      {intervention === 3 && <Material />}
      {(intervention === 3 || intervention === 2) && <Supplier />}
      <SupplierImpact />
    </>
  );
};

export default Step2;
