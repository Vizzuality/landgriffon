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
