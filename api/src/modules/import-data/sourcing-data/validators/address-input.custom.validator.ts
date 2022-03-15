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
      (args.object as any).location_type === LOCATION_TYPES.UNKNOWN ||
      (args.object as any).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !addressInput;
    } else if (
      ((args.object as any).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as any).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      ((args.object as any).location_latitude_input ||
        (args.object as any).location_longitude_input)
    ) {
      return !addressInput;
    } else if (
      ((args.object as any).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as any).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (!(args.object as any).location_latitude_input ||
        !(args.object as any).location_longitude_input)
    ) {
      return typeof addressInput === 'string' && addressInput.length > 2;
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
      return `Address must be empty for locations of type ${
        JSON.parse(JSON.stringify(args.object)).location_type
      }`;
    } else if (
      ((args.object as any).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as any).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      ((args.object as any).location_latitude_input ||
        (args.object as any).location_longitude_input)
    ) {
      return `Address input OR coordinates are required for locations of type ${
        (args.object as any).location_type
      }. Address must be empty if coordinates are provided`;
    } else {
      return `Address input or coordinates are required for locations of type ${
        (args.object as any).location_type
      }.`;
    }
  }
}
