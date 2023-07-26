import { IsString, Validate } from 'class-validator';
import { PasswordValidation } from 'decorators/password-validator.decorator';

export class ResetPasswordDto {
  @IsString()
  @Validate(PasswordValidation)
  readonly password: string;
}
