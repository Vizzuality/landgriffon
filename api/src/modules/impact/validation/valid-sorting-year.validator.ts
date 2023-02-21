import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { AnyImpactTableDto } from 'modules/impact/dto/impact-table.dto';

// Custom validator that checks to be used by Impact Table dtos
// checks that the sortingYear value of the dto is comprised between startYear and endYear
@ValidatorConstraint({ name: 'ValidSortingYearValidator', async: false })
export class ValidSortingYearValidator implements ValidatorConstraintInterface {
  validate(
    value: number,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    const dto: AnyImpactTableDto =
      validationArguments?.object as AnyImpactTableDto;
    return value >= dto.startYear && value <= dto.endYear;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const dto: AnyImpactTableDto =
      validationArguments?.object as AnyImpactTableDto;
    return `sortingYear must be have a value between startYear and endYear. ${dto.startYear} and ${dto.endYear} on this request.`;
  }
}
