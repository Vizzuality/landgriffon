import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as config from 'config';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'PasswordValidation', async: false })
export class PasswordValidation implements ValidatorConstraintInterface {
  constructor(
    @Inject('PASSWORD_INCLUDE_UPPER_CASE') private includeUpperCase: boolean,
    @Inject('PASSWORD_INCLUDE_NUMERICS') private includeNumerics: boolean,
    @Inject('PASSWORD_INCLUDE_SPECIAL_CHARACTERS')
    private includeSpecialCharacters: boolean,
    @Inject('PASSWORD_MIN_LENGTH') private passwordMinLength: number,
  ) {}

  validate(password: string): boolean {
    return (
      this.minLengthCheck(password) &&
      this.upperCaseCheck(password) &&
      this.includeNumericsCheck(password) &&
      this.includeSpecialCharactersCheck(password)
    );
  }

  private minLengthCheck(password: string): boolean {
    return this.passwordMinLength <= password.length;
  }

  private upperCaseCheck(password: string): boolean {
    return !(this.includeUpperCase && password.toLowerCase() === password);
  }

  private includeNumericsCheck(password: string): boolean {
    return !(this.includeNumerics && !/\d/.test(password));
  }

  private includeSpecialCharactersCheck(password: string): boolean {
    return !(
      this.includeSpecialCharacters && !/(?=.*[!@#$%^&*])/.test(password)
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const password: string = args.value;
    const errors: string[] = [];

    if (!this.minLengthCheck(password))
      errors.push(
        `Password too short, minimal length is ${this.passwordMinLength}`,
      );
    if (!this.upperCaseCheck(password))
      errors.push(`Password must contain at least 1 upper case letter`);
    if (!this.includeNumericsCheck(password))
      errors.push(`Password must contain at least 1 numeric character`);
    if (!this.includeSpecialCharactersCheck(password))
      errors.push(
        `Password must contain at least 1 special character (!@#$%^&*)`,
      );

    return errors.join('. ');
  }
}
