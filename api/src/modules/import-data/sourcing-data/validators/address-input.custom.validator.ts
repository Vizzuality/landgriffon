import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingDataExcelValidator } from 'modules/import-data/sourcing-data/validators/sourcing-data.class.validator';

@ValidatorConstraint({ name: 'location_address', async: false })
export class LocationAddressInputValidator
  implements ValidatorConstraintInterface
{
  validate(addressInput: string, args: ValidationArguments): boolean {
    if (
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.UNKNOWN ||
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !addressInput;
    } else if (
      ((args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT ||
        (args.object as SourcingDataExcelValidator).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      ((args.object as SourcingDataExcelValidator).location_latitude_input ||
        (args.object as SourcingDataExcelValidator).location_longitude_input)
    ) {
      return !addressInput;
    } else if (
      ((args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT ||
        (args.object as SourcingDataExcelValidator).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (!(args.object as SourcingDataExcelValidator).location_latitude_input ||
        !(args.object as SourcingDataExcelValidator).location_longitude_input)
    ) {
      return typeof addressInput === 'string' && addressInput.length > 2;
    } else {
      return true;
    }
  }
  defaultMessage(args: ValidationArguments): string {
    if (
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.UNKNOWN ||
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return `Address must be empty for locations of type ${
        JSON.parse(JSON.stringify(args.object)).location_type
      }`;
    } else if (
      ((args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT ||
        (args.object as SourcingDataExcelValidator).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      ((args.object as SourcingDataExcelValidator).location_latitude_input ||
        (args.object as SourcingDataExcelValidator).location_longitude_input)
    ) {
      return `Address input OR coordinates are required for locations of type ${
        (args.object as SourcingDataExcelValidator).location_type
      }. Address must be empty if coordinates are provided`;
    } else {
      return `Address input or coordinates are required for locations of type ${
        (args.object as SourcingDataExcelValidator).location_type
      }.`;
    }
  }
}
