import { useMemo } from 'react';
import { InterventionTypes } from '../enums';

import type { Intervention } from '../types';

const InterventionPhrase: React.FC<Intervention> = (intervention) => {
  const year = useMemo(
    () => <strong>{intervention.startYear} 2020</strong>,
    [intervention.startYear],
  );

  const materials = useMemo(
    () => <strong>{intervention.replacedMaterials[0].name}</strong>,
    [intervention.replacedMaterials],
  );

  const business = useMemo(
    () => <strong>{intervention.replacedBusinessUnits[0].name}</strong>,
    [intervention.replacedBusinessUnits],
  );

  const suppliers = useMemo(
    () => <strong>{intervention.replacedSuppliers[0].name}</strong>,
    [intervention.replacedSuppliers],
  );

  const regions = useMemo(
    () => <strong>{intervention.replacedAdminRegions[0].name}</strong>,
    [intervention.replacedAdminRegions],
  );

  const result = useMemo(() => {
    if (intervention.type === InterventionTypes.Material) {
      return (
        <>
          Switch {materials} to <strong>New material</strong>
          in {year} for {business} and {suppliers} in {regions}
        </>
      );
    }
    if (intervention.type === InterventionTypes.SupplierLocation) {
      return (
        <>
          Switch {materials} from <strong>New region</strong> in {year} {business}
        </>
      );
    }
    if (intervention.type === InterventionTypes.Efficiency) {
      return (
        <>
          Change efficiency for {materials} in {year} for {business} and {suppliers} in {regions}
        </>
      );
    }
    return null;
  }, [business, intervention.type, materials, regions, suppliers, year]);

  return <span>{result}</span>;
};

export default InterventionPhrase;
