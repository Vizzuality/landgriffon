import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class IndicatorsSheetValidator {
  @IsString({ message: 'Indicator name must be a string' })
  @IsNotEmpty({ message: 'Indicator name must not be empty' })
  @MinLength(1, { message: 'Indicator name is too short' })
  name!: string;

  @IsString({ message: 'Indicator description must be a string' })
  @IsNotEmpty({ message: 'Indicator description must not be empty' })
  @IsEnum(['active', 'inactive'], {
    message: 'Indicator status must be active or inactive',
  })
  status!: string;

  @IsString({ message: 'Indicator name code must be a string' })
  @IsNotEmpty({ message: 'Indicator name code must not be empty' })
  @MinLength(1, { message: 'Indicator name code is too short' })
  nameCode!: string;
}
