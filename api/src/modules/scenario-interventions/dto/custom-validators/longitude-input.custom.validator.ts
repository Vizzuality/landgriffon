import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { CreateScenarioInterventionDto } from '../create.scenario-intervention.dto';

@ValidatorConstraint({ name: 'newLocationLongitude', async: false })
export class InterventionLocationLongitudeInputValidator
  implements ValidatorConstraintInterface
{
  validate(newLocationLongitude: number, args: ValidationArguments): boolean {
    if (
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.UNKNOWN ||
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !newLocationLongitude;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (args.object as CreateScenarioInterventionDto).newLocationAddressInput
    ) {
      return !newLocationLongitude;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      !(args.object as CreateScenarioInterventionDto).newLocationAddressInput
    ) {
      return newLocationLongitude >= -180 && newLocationLongitude <= 180;
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
    } else {
      return `Address input or coordinates are required for locations of type ${
        (args.object as CreateScenarioInterventionDto).newLocationType
      }. Longitude values must be min: -180, max: 180`;
    }
  }
}
