import { LocationTypeWithLabel } from 'modules/sourcing-locations/dto/location-type.sourcing-locations.dto';
import { LOCATION_TYPES_PARAMS } from 'modules/sourcing-locations/sourcing-location.entity';

// Helper to parse location types to the format the client consumes it

export const locationTypeParser = (
  locationTypes: { locationType: string }[],
): LocationTypeWithLabel[] => {
  return locationTypes.map((locationType: { locationType: string }) => {
    return {
      label:
        locationType.locationType.replace(/-/g, ' ').charAt(0).toUpperCase() +
        locationType.locationType.replace(/-/g, ' ').slice(1),
      value: locationType.locationType.replace(
        / /g,
        '-',
      ) as LOCATION_TYPES_PARAMS,
    };
  });
};
