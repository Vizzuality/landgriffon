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
    const dto: CreateScenarioInterventionDto =
      args.object as CreateScenarioInterventionDto;

    if (this.addressMustBeEmpty(dto)) {
      return !newLocationAddressInput;
    } else if (this.dtoAlreadyHasCoordinates(dto)) {
      return !newLocationAddressInput;
    } else if (this.addressIsRequired(dto)) {
      return (
        typeof newLocationAddressInput === 'string' &&
        newLocationAddressInput.length > 2
      );
    } else {
      return true;
    }
  }
  defaultMessage(args: ValidationArguments): string {
    const dto: CreateScenarioInterventionDto =
      args.object as CreateScenarioInterventionDto;

    if (this.addressMustBeEmpty(dto)) {
      return `Address must be empty for locations of type ${
        JSON.parse(JSON.stringify(dto)).newLocationType
      }`;
    } else if (this.dtoAlreadyHasCoordinates(dto)) {
      return `Address input OR coordinates are required for locations of type ${dto.newLocationType}. Address must be empty if coordinates are provided`;
    } else {
      return `Address input or coordinates are required for locations of type ${dto.newLocationType}.`;
    }
  }

  addressMustBeEmpty(dto: CreateScenarioInterventionDto): boolean {
    return dto.newLocationType === LOCATION_TYPES.UNKNOWN ||
      dto.newLocationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION
      ? true
      : false;
  }

  dtoAlreadyHasCoordinates(dto: CreateScenarioInterventionDto): boolean {
    return (dto.newLocationType === LOCATION_TYPES.AGGREGATION_POINT ||
      dto.newLocationType === LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (dto.newLocationLatitude || dto.newLocationLongitude)
      ? true
      : false;
  }

  addressIsRequired(dto: CreateScenarioInterventionDto): boolean {
    return (dto.newLocationType === LOCATION_TYPES.AGGREGATION_POINT ||
      dto.newLocationType === LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (!dto.newLocationLatitude || !dto.newLocationLongitude)
      ? true
      : false;
  }
}

('Address input or coordinates are required for locations of type aggregation point. Latitude values must be min: -90, max: 90,Address input or coordinates are required for locations of type aggregation point. Longitude values must be min: -180, max: 180,New Location Country input is required for the selected intervention and location type');
('Address input or coordinates are required for locations of type aggregation point.,Address input or coordinates are required for locations of type aggregation point. Latitude values must be min: -90, max: 90,Address input or coordinates are required for locations of type aggregation point. Longitude values must be min: -180, max: 180,New Location Country input is required for the selected intervention and location type');
