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
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.UNKNOWN ||
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !longitudeInput;
    } else if (
      (JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        JSON.parse(JSON.stringify(args.object)).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      !JSON.parse(JSON.stringify(args.object)).location_address_input
    ) {
      return longitudeInput >= -180 && longitudeInput <= 180;
    } else {
      return true;
    }
  }
  defaultMessage(args: ValidationArguments): string {
    if (
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.UNKNOWN ||
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return `Coordinates must be empty for locations of type ${
        JSON.parse(JSON.stringify(args.object)).location_type
      }`;
    } else if (
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.POINT_OF_PRODUCTION
    ) {
      return `Address input or coordinates are obligatory for locations of type ${
        JSON.parse(JSON.stringify(args.object)).location_type
      }. Longitude values must be min: -180, max: 180`;
    } else {
      return 'Incorrect Input value for selected location type';
    }
  }
}
