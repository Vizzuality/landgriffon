import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as config from 'config';

@ValidatorConstraint({ name: 'PasswordValidation', async: false })
export class PasswordValidation implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    const minLength: number = config.get('password.minLength');
    const includeUpperCase: boolean = config.get('password.includeUpperCase');
    const includeNumerics: boolean = config.get('password.includeNumerics');
    const includeSpecialCharacters: boolean = config.get(
      'password.includeSpecialCharacters',
    );

    if (minLength > password.length) return false;
    if (includeUpperCase && password.toLowerCase() === password) return false;
    if (includeNumerics && !/\d/.test(password)) return false;
    if (includeSpecialCharacters && !/(?=.*[!@#$%^&*])/.test(password))
      return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Weak password';
  }
}
