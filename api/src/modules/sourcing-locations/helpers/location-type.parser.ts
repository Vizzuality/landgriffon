import { LocationTypeWithLabel } from 'modules/sourcing-locations/dto/location-type.sourcing-locations.dto';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

// Helper to parse location types to the format the client consumes it

export const locationTypeParser = (
  locationTypes: { locationType: string }[],
): LocationTypeWithLabel[] => {
  return locationTypes.map((locationType: { locationType: string }) => {
    return {
      label:
        locationType.locationType.replace(/-/g, ' ').charAt(0).toUpperCase() +
        locationType.locationType.replace(/-/g, ' ').slice(1),
      value: toLocationType(locationType.locationType),
    };
  });
};

export const toLocationType = (locationType: string): LOCATION_TYPES =>
  locationType.replace(/ /g, '-') as LOCATION_TYPES;
