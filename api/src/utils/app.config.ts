import { Logger } from '@nestjs/common';
import * as config from 'config';
import { isNil } from 'lodash';

/**
 * Utility functions related to app configuration.
 */
export class AppConfig {
  /**
   * Read a config value from a given config property; return defaultValue if
   * property does not exist.
   */
  static get<T>(property: string, defaultValue?: T): T {
    if (config.has(property)) {
      return config.get(property);
    }

    if (!isNil(defaultValue)) {
      return defaultValue;
    }

    throw new Error(
      `The environment variable for config property ${property} is not defined and no default was provided.`,
    );
  }

  /**
   * Read a config value from a give config property and return it as boolean;
   * return defaultValue if property does not exist.
   */
  static getBoolean(property: string, defaultValue?: boolean): boolean {
    /**
     * value could be a string ('false' | 'true', if set correctly) or a boolean
     * (for example, if set via `config`), so we always convert toString() the
     * value (which would be a noop in case the value read is already a string)
     * before attempting to lowercase it.
     */
    const parsedValue: string = this.get<string | boolean>(
      property,
      defaultValue?.toString(),
    )
      .toString()
      .toLowerCase();

    if (parsedValue === 'true') return true;
    if (parsedValue === 'false') return false;
    throw new Error(`Expected boolean value, but ${parsedValue} was provided`);
  }

  static getInt(property: string, defaultValue?: number): number {
    return this.get<number>(property, defaultValue);
  }

  /**
   * Compile list of config values from: 1. a config property as array of
   * values, and 2. a comma-separated list as string. The latter would typically
   * be a string read from an environment variable and mapped to a config
   * property.
   */
  static getFromArrayAndParsedString<T>(
    arrayProperty: string,
    stringProperty?: string,
    defaultValue?: T,
  ): (T | string)[] {
    // Array from config property
    const valuesFromArray: T[] = this.get<T[]>(arrayProperty, []);
    let valuesFromParsedString: string[] = [];
    if (stringProperty) {
      // This may be a comma-separated list
      const valuesFromString: T | null = stringProperty
        ? this.get(stringProperty, defaultValue)
        : null;
      /**
       * If valuesFromString is a string, split it as comma-separated
       *
       * @debt we should provide a way to use escaped commas if actual values
       * can contain such character.
       */
      if (typeof valuesFromString === 'string') {
        valuesFromParsedString = valuesFromString.split(',');
      } else {
        Logger.warn(
          `Value of the ${stringProperty} config property should be a string, ${typeof valuesFromString} found: its contents will be ignored.`,
        );
      }
    }
    // Merge
    return valuesFromArray
      ? [...valuesFromArray, ...valuesFromParsedString]
      : [...valuesFromParsedString];
  }
}
