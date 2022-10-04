import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as config from 'config';

@ValidatorConstraint({ name: 'PasswordValidation', async: false })
export class PasswordValidation implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    return (
      PasswordValidation.minLengthCheck(password) &&
      PasswordValidation.upperCaseCheck(password) &&
      PasswordValidation.includeNumericsCheck(password) &&
      PasswordValidation.includeSpecialCharactersCheck(password)
    );
  }

  private static minLengthCheck(password: string): boolean {
    const minLength: number = +`${config.get('auth.password.minLength')}`;
    return minLength <= password.length;
  }

  private static upperCaseCheck(password: string): boolean {
    const includeUpperCase: boolean =
      `${config.get('auth.password.includeUpperCase')}`.toLowerCase() ===
      'true';
    return !(includeUpperCase && password.toLowerCase() === password);
  }

  private static includeNumericsCheck(password: string): boolean {
    const includeNumerics: boolean =
      `${config.get('auth.password.includeNumerics')}`.toLowerCase() === 'true';
    return !(includeNumerics && !/\d/.test(password));
  }

  private static includeSpecialCharactersCheck(password: string): boolean {
    const includeSpecialCharacters: boolean =
      `${config.get(
        'auth.password.includeSpecialCharacters',
      )}`.toLowerCase() === 'true';

    return !(includeSpecialCharacters && !/(?=.*[!@#$%^&*])/.test(password));
  }

  defaultMessage(args: ValidationArguments): string {
    const password: string = args.value;
    const errors: string[] = [];

    if (!PasswordValidation.minLengthCheck(password))
      errors.push(
        `Password too short, minimal length is ${config.get(
          'auth.password.minLength',
        )}`,
      );
    if (!PasswordValidation.upperCaseCheck(password))
      errors.push(`Password must contain at least 1 upper case letter`);
    if (!PasswordValidation.includeNumericsCheck(password))
      errors.push(`Password must contain at least 1 numeric character`);
    if (!PasswordValidation.includeSpecialCharactersCheck(password))
      errors.push(
        `Password must contain at least 1 special character (!@#$%^&*)`,
      );

    return errors.join('. ');
  }
}
