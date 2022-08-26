import { useMemo } from 'react';
import { InterventionTypes } from '../enums';

import type { Intervention } from '../types';

type InterventionPhraseProps = {
  intervention: Intervention;
  short?: boolean;
};

const InterventionPhrase: React.FC<InterventionPhraseProps> = ({ intervention, short = false }) => {
  const year = useMemo(() => <strong>{intervention.startYear}</strong>, [intervention.startYear]);

  const materials = useMemo(
    () => <strong>{intervention.replacedMaterials[0].name}</strong>,
    [intervention.replacedMaterials],
  );

  const business = useMemo(
    () => <strong>{intervention.replacedBusinessUnits[0].name}</strong>,
    [intervention.replacedBusinessUnits],
  );

  const suppliers = useMemo(() => {
    if (intervention.replacedSuppliers?.length)
      return <strong>{intervention.replacedSuppliers[0].name}</strong>;
  }, [intervention.replacedSuppliers]);

  const regions = useMemo(
    () => <strong>{intervention.replacedAdminRegions[0].name}</strong>,
    [intervention.replacedAdminRegions],
  );

  const newMaterial = intervention.newMaterial?.name || 'New material';
  const newRegion = intervention.newAdminRegion?.name || 'New region';

  const result = useMemo(() => {
    if (intervention.type === InterventionTypes.Material) {
      return (
        <>
          Switch {materials} to <strong>{newMaterial}</strong> in {year}
          {!short && (
            <>
              {' '}
              for {business} and {suppliers} in {regions}
            </>
          )}
        </>
      );
    }
    if (intervention.type === InterventionTypes.SupplierLocation) {
      return (
        <>
          Source {materials} from <strong>{newRegion}</strong> in {year}
          {!short && <>for {business}</>}
        </>
      );
    }
    if (intervention.type === InterventionTypes.Efficiency) {
      return (
        <>
          Change efficiency for {materials} in {year}
          {!short && (
            <>
              {' '}
              for {business} and {suppliers}
            </>
          )}{' '}
          in {regions}
        </>
      );
    }
    return null;
  }, [
    business,
    intervention.type,
    materials,
    newMaterial,
    newRegion,
    regions,
    short,
    suppliers,
    year,
  ]);

  return <span>{result}</span>;
};

export default InterventionPhrase;
