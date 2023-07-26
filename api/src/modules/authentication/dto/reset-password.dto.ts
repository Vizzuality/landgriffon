import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { PasswordValidation } from 'decorators/password-validator.decorator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(PasswordValidation)
  readonly password: string;
}
