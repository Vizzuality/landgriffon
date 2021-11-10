import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsGreaterOrEqualThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: Record<string, any>, propertyName: string): void => {
    registerDecorator({
      name: 'IsGreaterOrEqualThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue: any = (args.object as any)[relatedPropertyName];
          if (
            typeof value === 'undefined' &&
            typeof relatedValue === 'undefined'
          ) {
            return true;
          }
          return (
            typeof value === 'number' &&
            typeof relatedValue === 'number' &&
            value >= relatedValue
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue: any = (args.object as any)[relatedPropertyName];
          return `Value ${args.property} (${args.value}) must be greater or equal than the value of ${relatedPropertyName} (${relatedValue})`;
        },
      },
    });
  };
}

export function IsSmallerOrEqualThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: Record<string, any>, propertyName: string): void => {
    registerDecorator({
      name: 'IsSmallerOrEqualThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue: any = (args.object as any)[relatedPropertyName];
          if (
            typeof value === 'undefined' &&
            typeof relatedValue === 'undefined'
          ) {
            return true;
          }
          return (
            typeof value === 'number' &&
            typeof relatedValue === 'number' &&
            value <= relatedValue
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue: any = (args.object as any)[relatedPropertyName];
          return `Value ${args.property} (${args.value}) must be smaller or equal than the value of ${relatedPropertyName} (${relatedValue})`;
        },
      },
    });
  };
}
