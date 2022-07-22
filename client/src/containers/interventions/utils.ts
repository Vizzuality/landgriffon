import type { InterventionDto, InterventionFormData } from './types';
import type { SelectOption } from 'components/select/types';

function getValue(option: SelectOption): SelectOption['value'] {
  return option.value;
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
    mewLocationCountryInput,
    DF_LUC_T,
    UWU_T,
    BL_LUC_T,
    GHG_LUC_T,
    ...rest
  } = interventionFormData;

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
    mewLocationCountryInput: getValue(mewLocationCountryInput) as string,

    newT1SupplierId: getValue(newT1SupplierId) as string,
    newProducerId: getValue(newProducerId) as string,

    newIndicatorCoefficients: {
      DF_LUC_T,
      UWU_T,
      BL_LUC_T,
      GHG_LUC_T,
    },
  };

  return result;
}
