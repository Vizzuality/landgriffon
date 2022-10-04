import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingDataExcelValidator } from 'modules/import-data/sourcing-data/validators/sourcing-data.class.validator';

@ValidatorConstraint({ name: 'latitude', async: false })
export class LocationLatitudeInputValidator
  implements ValidatorConstraintInterface
{
  validate(latitudeInput: number, args: ValidationArguments): boolean {
    if (
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.UNKNOWN ||
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !latitudeInput;
    } else if (
      ((args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as SourcingDataExcelValidator).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (args.object as SourcingDataExcelValidator).location_address_input
    ) {
      return !latitudeInput;
    } else if (
      ((args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as SourcingDataExcelValidator).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      !(args.object as SourcingDataExcelValidator).location_address_input
    ) {
      return latitudeInput >= -90 && latitudeInput <= 90;
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
      return `Coordinates must be empty for locations of type ${
        (args.object as SourcingDataExcelValidator).location_type
      }`;
    } else if (
      ((args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as SourcingDataExcelValidator).location_type ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (args.object as SourcingDataExcelValidator).location_address_input
    ) {
      return `Address input OR coordinates must be provided for locations of type ${
        (args.object as SourcingDataExcelValidator).location_type
      }. Latitude must be empty if address is provided`;
    } else if (
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.AGGREGATION_POINT ||
      (args.object as SourcingDataExcelValidator).location_type ===
        LOCATION_TYPES.POINT_OF_PRODUCTION
    ) {
      return `Address input or coordinates are required for locations of type ${
        (args.object as SourcingDataExcelValidator).location_type
      }. Latitude values must be min: -90, max: 90`;
    } else {
      return 'Incorrect Input value for selected location type';
    }
  }
}
