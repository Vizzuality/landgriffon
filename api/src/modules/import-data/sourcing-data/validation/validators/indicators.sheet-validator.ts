import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class IndicatorsSheetValidator {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['active', 'inactive'])
  status!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  nameCode!: string;
}
