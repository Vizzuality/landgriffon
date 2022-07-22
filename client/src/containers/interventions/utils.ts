import type { InterventionDto, InterventionFormData } from './types';
import type { SelectOption } from 'components/select/types';

function getValue(option: SelectOption): SelectOption['value'] {
  if (option?.value) {
    const valueToNumber = Number(option.value);
    if (!Number.isNaN(valueToNumber)) return valueToNumber;
    return option.value;
  }
  return null;
}

export function parseInterventionFormDataToDto(
  interventionFormData: InterventionFormData,
): InterventionDto {
  const {
    interventionType,
    startYear,
    materialIds,
    businessUnitIds,
    supplierIds,
    adminRegionIds,
    newMaterialId,
    newT1SupplierId,
    newProducerId,
    newLocationType,
    newLocationCountryInput,
    DF_LUC_T,
    UWU_T,
    BL_LUC_T,
    GHG_LUC_T,
    ...rest
  } = interventionFormData;
  const thereIsCoefficients = !!(DF_LUC_T || UWU_T || BL_LUC_T || GHG_LUC_T);

  const result: InterventionDto = {
    ...rest,
    type: interventionType,
    startYear: getValue(startYear) as number,

    materialIds: materialIds?.map(getValue) as string[],
    businessUnitIds: businessUnitIds?.map(getValue) as string[],
    supplierIds: supplierIds?.map(getValue) as string[],
    adminRegionIds: adminRegionIds?.map(getValue) as string[],

    newMaterialId: getValue(newMaterialId) as string,

    newLocationType: getValue(newLocationType) as string,
    newLocationCountryInput: newLocationCountryInput?.label,

    newT1SupplierId: getValue(newT1SupplierId) as string,
    newProducerId: getValue(newProducerId) as string,

    ...(thereIsCoefficients
      ? {
          newIndicatorCoefficients: {
            DF_LUC_T,
            UWU_T,
            BL_LUC_T,
            GHG_LUC_T,
          },
        }
      : {}),
  };

  return result;
}
