import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { PasswordValidation } from 'decorators/password-validator.decorator';
import { ROLES } from 'modules/authorization/roles/roles.enum';

/**
 * @todo Allow to provide fname/lname/display name on signup (and any other
 * relevant user data), if needed. Probably We could just start with
 * displayName, email and password, following the designs, and once the user has
 * validated their email address we can let them log in and set any other info.
 */
export class SignUpDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string | null;

  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  fname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  lname?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(1e5)
  avatarDataUrl?: string;

  @IsOptional()
  @IsDefined()
  @IsString()
  @ApiProperty()
  @Validate(PasswordValidation)
  password?: string;

  @ApiPropertyOptional({
    enum: ROLES,
    type: ROLES,
    example: Object.values(ROLES),
    isArray: true,
  })
  @IsOptional()
  @IsEnum(ROLES, { each: true })
  roles?: ROLES[];
}
