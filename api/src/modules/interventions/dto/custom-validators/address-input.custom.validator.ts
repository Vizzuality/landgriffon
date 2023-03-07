import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';

import { CreateInterventionDto } from 'modules/interventions/dto/create.intervention.dto';

@ValidatorConstraint({ name: 'newLocationAddressInput', async: false })
export class InterventionLocationAddressInputValidator
  implements ValidatorConstraintInterface
{
  validate(
    newLocationAddressInput: string,
    args: ValidationArguments,
  ): boolean {
    const dto: CreateInterventionDto = args.object as CreateInterventionDto;

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
    const dto: CreateInterventionDto = args.object as CreateInterventionDto;

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

  addressMustBeEmpty(dto: CreateInterventionDto): boolean {
    return dto.newLocationType === LOCATION_TYPES.UNKNOWN ||
      dto.newLocationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION
      ? true
      : false;
  }

  dtoAlreadyHasCoordinates(dto: CreateInterventionDto): boolean {
    return (dto.newLocationType ===
      LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT ||
      dto.newLocationType === LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (dto.newLocationLatitude || dto.newLocationLongitude)
      ? true
      : false;
  }

  addressIsRequired(dto: CreateInterventionDto): boolean {
    return (dto.newLocationType ===
      LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT ||
      dto.newLocationType === LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      (!dto.newLocationLatitude || !dto.newLocationLongitude)
      ? true
      : false;
  }
}
