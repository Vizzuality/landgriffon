import {
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

//TODO: double check if we only use the material sheet in the excel to activate materials

export class SheetValidatorMaterial {
  @IsString()
  @MinLength(1, { message: 'Material hs_2017_code is too short' })
  @IsNotEmpty({ message: 'Material hs_2017_code must not be empty' })
  hs_2017_code: string;

  @IsNotEmpty({ message: 'Material Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  @IsEnum(['active', 'inactive'])
  status: string;

  @IsOptional()
  @IsJSON()
  metadata: string;
}
