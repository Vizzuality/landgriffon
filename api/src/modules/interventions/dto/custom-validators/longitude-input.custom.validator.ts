import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LOCATION_TYPES } from 'modules/sourcing-locations/sourcing-location.entity';
import { CreateInterventionDto } from 'modules/interventions/dto/create.intervention.dto';

@ValidatorConstraint({ name: 'newLocationLongitude', async: false })
export class InterventionLocationLongitudeInputValidator
  implements ValidatorConstraintInterface
{
  validate(newLocationLongitude: number, args: ValidationArguments): boolean {
    const dto: CreateInterventionDto = args.object as CreateInterventionDto;

    if (this.coordinatesMustBeEmpty(dto)) {
      return !newLocationLongitude;
    } else if (this.dtoAlreadyHasAddress(dto)) {
      return !newLocationLongitude;
    } else if (this.coordinateIsRequired(dto)) {
      return newLocationLongitude >= -180 && newLocationLongitude <= 180;
    } else {
      return true;
    }
  }
  defaultMessage(args: ValidationArguments): string {
    const dto: CreateInterventionDto = args.object as CreateInterventionDto;
    if (this.coordinatesMustBeEmpty(dto)) {
      return `Coordinates must be empty for locations of type ${dto.newLocationType}`;
    } else if (this.dtoAlreadyHasAddress(dto)) {
      return `Address input OR coordinates must be provided for locations of type ${dto.newLocationType}. Longitude must be empty if address is provided`;
    } else if (this.coordinateIsRequired(dto)) {
      return `Address input or coordinates are required for locations of type ${
        (args.object as CreateInterventionDto).newLocationType
      }. Longitude values must be min: -180, max: 180`;
    } else {
      return 'Incorrect Input value for selected location type';
    }
  }

  coordinatesMustBeEmpty(dto: CreateInterventionDto): boolean {
    return dto.newLocationType === LOCATION_TYPES.UNKNOWN ||
      dto.newLocationType === LOCATION_TYPES.COUNTRY_OF_PRODUCTION
      ? true
      : false;
  }

  dtoAlreadyHasAddress(dto: CreateInterventionDto): boolean {
    return (dto.newLocationType ===
      LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT ||
      dto.newLocationType === LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      dto.newLocationAddressInput
      ? true
      : false;
  }

  coordinateIsRequired(dto: CreateInterventionDto): boolean {
    return (dto.newLocationType ===
      LOCATION_TYPES.PRODUCTION_AGGREGATION_POINT ||
      dto.newLocationType === LOCATION_TYPES.POINT_OF_PRODUCTION) &&
      !dto.newLocationAddressInput
      ? true
      : false;
  }
}
