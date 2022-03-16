import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

@ValidatorConstraint({ name: 'longitude', async: false })
export class LocationLongitudeInputValidator
  implements ValidatorConstraintInterface
{
  validate(longitudeInput: number, args: ValidationArguments): boolean {
    if (
      (args.object as any).location_type === LOCATION_TYPES.UNKNOWN ||
      (args.object as any).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !longitudeInput;
    } else if (
      ((args.object as any).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as any).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (args.object as any).location_address_input
    ) {
      return !longitudeInput;
    } else if (
      ((args.object as any).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as any).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      !(args.object as any).location_address_input
    ) {
      return longitudeInput >= -180 && longitudeInput <= 180;
    } else {
      return true;
    }
  }
  defaultMessage(args: ValidationArguments): string {
    if (
      (args.object as any).location_type === LOCATION_TYPES.UNKNOWN ||
      (args.object as any).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return `Coordinates must be empty for locations of type ${
        (args.object as any).location_type
      }`;
    } else if (
      ((args.object as any).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as any).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (args.object as any).location_address_input
    ) {
      return `Address input OR coordinates must be provided for locations of type ${
        (args.object as any).location_type
      }. Latitude must be empty if address is provided`;
    } else {
      return `Address input or coordinates are required for locations of type ${
        (args.object as any).location_type
      }. Longitude values must be min: -180, max: 180`;
    }
  }
}
