import type { InterventionDto, InterventionFormData } from './types';
import { InterventionTypes, LocationTypes } from './enums';
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
    newLocationAddressInput,
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

    // * if an address is provided for certain location types, latitude and longitudes are nullified
    ...([LocationTypes.aggregationPoint, LocationTypes.pointOfProduction].includes(
      newLocationType.value as LocationTypes,
    ) &&
      newLocationAddressInput && {
        newLocationAddressInput,
        newLocationLatitude: null,
        newLocationLongitude: null,
      }),

    newT1SupplierId: getValue(newT1SupplierId) as string,
    newProducerId: getValue(newProducerId) as string,

    // * for "Change production efficiency" intervention type, coeficients are always sent even if the user hasn't filled them (default to 0).
    // * for other intervention types, coeficients are sent only if the user has filled any of them.
    ...(interventionType === InterventionTypes.Efficiency
      ? {
          newIndicatorCoefficients: {
            DF_LUC_T: DF_LUC_T || 0,
            UWU_T: UWU_T || 0,
            BL_LUC_T: BL_LUC_T || 0,
            GHG_LUC_T: GHG_LUC_T || 0,
          },
        }
      : {
          ...((DF_LUC_T || UWU_T || BL_LUC_T || GHG_LUC_T) && {
            newIndicatorCoefficients: {
              DF_LUC_T: DF_LUC_T || 0,
              UWU_T: UWU_T || 0,
              BL_LUC_T: BL_LUC_T || 0,
              GHG_LUC_T: GHG_LUC_T || 0,
            },
          }),
        }),
  };

  return result;
}
