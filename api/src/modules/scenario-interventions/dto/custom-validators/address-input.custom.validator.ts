import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

import { CreateScenarioInterventionDto } from '../create.scenario-intervention.dto';

@ValidatorConstraint({ name: 'newLocationAddressInput', async: false })
export class InterventionLocationAddressInputValidator
  implements ValidatorConstraintInterface
{
  validate(
    newLocationAddressInput: string,
    args: ValidationArguments,
  ): boolean {
    if (
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.UNKNOWN ||
      (args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.COUNTRY_OF_PRODUCTION
    ) {
      return !newLocationAddressInput;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      ((args.object as CreateScenarioInterventionDto).newLocationLatitude ||
        (args.object as CreateScenarioInterventionDto).newLocationLongitude)
    ) {
      return !newLocationAddressInput;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (!(args.object as CreateScenarioInterventionDto).newLocationLatitude ||
        !(args.object as CreateScenarioInterventionDto).newLocationLongitude)
    ) {
      return (
        typeof newLocationAddressInput === 'string' &&
        newLocationAddressInput.length > 2
      );
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
      return `Address must be empty for locations of type ${
        JSON.parse(JSON.stringify(args.object)).newLocationType
      }`;
    } else if (
      ((args.object as CreateScenarioInterventionDto).newLocationType ===
        LOCATION_TYPES.AGGREGATION_POINT ||
        (args.object as CreateScenarioInterventionDto).newLocationType ===
          LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      ((args.object as CreateScenarioInterventionDto).newLocationLatitude ||
        (args.object as CreateScenarioInterventionDto).newLocationLongitude)
    ) {
      return `Address input OR coordinates are required for locations of type ${
        (args.object as CreateScenarioInterventionDto).newLocationType
      }. Address must be empty if coordinates are provided`;
    } else {
      return `Address input or coordinates are required for locations of type ${
        (args.object as CreateScenarioInterventionDto).newLocationType
      }.`;
    }
  }
}
