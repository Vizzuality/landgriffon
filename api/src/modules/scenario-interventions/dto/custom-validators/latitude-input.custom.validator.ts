import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { CreateScenarioInterventionDto } from '../create.scenario-intervention.dto';

@ValidatorConstraint({ name: 'newLocationLatitude', async: false })
export class InterventionLocationLatitudeInputValidator
  implements ValidatorConstraintInterface
{
  validate(newLocationLatitude: number, args: ValidationArguments): boolean {
    if (
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.UNKNOWN ||
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !newLocationLatitude;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (args.object as CreateScenarioInterventionDto).newLocationAddressInput
    ) {
      return !newLocationLatitude;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      !(args.object as CreateScenarioInterventionDto).newLocationAddressInput
    ) {
      return newLocationLatitude >= -90 && newLocationLatitude <= 90;
    } else {
      return true;
    }
  }
  defaultMessage(args: ValidationArguments): string {
    if (
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.UNKNOWN ||
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return `Coordinates must be empty for locations of type ${
        (args.object as CreateScenarioInterventionDto).newLocationType
      }`;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (args.object as CreateScenarioInterventionDto).newLocationAddressInput
    ) {
      return `Address input OR coordinates must be provided for locations of type ${
        (args.object as CreateScenarioInterventionDto).newLocationType
      }. Latitude must be empty if address is provided`;
    } else if (
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.POINT_OF_PRODUCTION
    ) {
      return `Address input or coordinates are required for locations of type ${
        (args.object as CreateScenarioInterventionDto).newLocationType
      }. Latitude values must be min: -90, max: 90`;
    } else {
      return 'Incorrect Input value for selected location type';
    }
  }
}
