import {
  LOCATION_TYPES,
  LOCATION_TYPES_PARAMS,
} from 'modules/sourcing-locations/sourcing-location.entity';

export function transformLocationType(
  locationTypesParams: LOCATION_TYPES_PARAMS[],
): LOCATION_TYPES[] {
  return locationTypesParams.map((el: LOCATION_TYPES_PARAMS) => {
    return el.replace(/-/g, ' ') as LOCATION_TYPES;
  });
}

export function transformSingleLocationType(
  locationTypesParam: LOCATION_TYPES_PARAMS | undefined,
): LOCATION_TYPES {
  if (locationTypesParam)
    return locationTypesParam.replace(/-/g, ' ') as LOCATION_TYPES;
  else return LOCATION_TYPES.UNKNOWN;
}
