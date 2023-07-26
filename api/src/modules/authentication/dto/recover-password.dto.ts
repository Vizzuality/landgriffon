import { IsEmail } from 'class-validator';

export class RecoverPasswordDto {
  @IsEmail()
  readonly email: string;
}
