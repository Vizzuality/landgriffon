import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

@ValidatorConstraint({ name: 'location_address', async: false })
export class LocationAddressInputValidator
  implements ValidatorConstraintInterface
{
  validate(addressInput: string, args: ValidationArguments): boolean {
    if (
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.UNKNOWN ||
      JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !addressInput;
    } else if (
      (JSON.parse(JSON.stringify(args.object)).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        JSON.parse(JSON.stringify(args.object)).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (!JSON.parse(JSON.stringify(args.object)).location_latitude_input ||
        !JSON.parse(JSON.stringify(args.object)).location_longitude_input)
    ) {
      return typeof addressInput === 'string' && addressInput.length > 2;
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
      return `Address must be empty for locations of type ${
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
      }.`;
    } else {
      return 'Incorrect Input value for selected location type';
    }
  }
}
