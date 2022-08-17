import type { InterventionDto, InterventionFormData } from './types';
import { InterventionTypes } from './enums';
import type { SelectOption } from 'components/select/types';

function emptyStringIsNull(value: string): string | null {
  return value === '' ? null : value;
}

function getValue(option: SelectOption): SelectOption['value'] {
  if (option?.value) {
    const valueToNumber = Number(option.value);
    if (!Number.isNaN(valueToNumber)) return valueToNumber;
    return emptyStringIsNull(option.value as string);
  }
  return null;
}

export function parseInterventionFormDataToDto(
  interventionFormData: InterventionFormData,
): InterventionDto {
  // removing some fields which API doesn't support
  delete interventionFormData.cityAddressCoordinates;

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

  const result: InterventionDto = {
    ...rest,
    type: interventionType,
    startYear: getValue(startYear) as number,

    materialIds: materialIds?.map(getValue) as string[],
    businessUnitIds: businessUnitIds?.map(getValue) as string[],
    supplierIds: supplierIds?.map(getValue) as string[],
    adminRegionIds: adminRegionIds?.map(getValue) as string[],

    newMaterialId: getValue(newMaterialId) as string,

    // * location-related fields are not sent when the intervention type is "Change production efficiency"
    ...(interventionType !== InterventionTypes.Efficiency && {
      newLocationType: getValue(newLocationType) as string,
      newLocationCountryInput: newLocationCountryInput?.label,
    }),

    newT1SupplierId: getValue(newT1SupplierId) as string,
    newProducerId: getValue(newProducerId) as string,

    // * coefficients are only sent when the intervention type is "Change production efficiency"
    ...(interventionType === InterventionTypes.Efficiency
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
