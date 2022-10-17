import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BaseImpactTableDto } from '../impact-table.dto';

@ValidatorConstraint({ name: 'newLocationAddressInput', async: false })
export class ImpactAnalysisStartYearValidator
  implements ValidatorConstraintInterface
{
  validate(startYear: string, args: ValidationArguments): boolean {
    const dto: BaseImpactTableDto = args.object as BaseImpactTableDto;
    if (dto.startYear > dto.endYear) {
      return !startYear;
    }
    return true;
  }
  defaultMessage(args: ValidationArguments): string {
    return 'Start year must be earlier than the end year';
  }
}
