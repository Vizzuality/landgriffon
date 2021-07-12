import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * @todo Allow to provide fname/lname/display name on signup (and any other
 * relevant user data), if needed. Probably We could just start with
 * displayName, email and password, following the designs, and once the user has
 * validated their email address we can let them log in and set any other info.
 */
export class SignUpDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsEmail()
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  email!: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  @ApiProperty()
  password!: string;
}
