import CustomMatcherResult = jest.CustomMatcherResult;
import { Response } from 'supertest';
import { isEqual, xor, cloneDeep } from 'lodash';
import ApplicationManager from './utils/application-manager';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveErrorMessage(
        code: number,
        message: string,
        bodyMessage?: string | string[],
      ): CustomMatcherResult;

      toHaveJSONAPIAttributes(
        expectedAttributes: string[],
      ): CustomMatcherResult;

      toEqualArrayUnordered(expected: any[]): CustomMatcherResult;
    }
  }
}

afterAll(async () => ApplicationManager.tearDown());

expect.extend({
  /**
   * Checks that two arrays are equivalent, with considering the order
   * @param actual
   * @param expected
   */
  toEqualArrayUnordered(actual: any[], expected: any[]): CustomMatcherResult {
    if (!Array.isArray(actual)) {
      throw new Error('The object to be evaluated must be an array');
    }
    if (!Array.isArray(expected)) {
      throw new Error('The expected object must be an array');
    }

    // Deep clone both array in order to mutate them when sorting afterwards
    const actualCopy = cloneDeep(actual);
    const expectedCopy = cloneDeep(expected);

    return {
      pass: isEqual(actualCopy.sort(), expectedCopy.sort()),
      message: (): string =>
        `Expected "${expectedCopy}" array, but got "${actualCopy}"`,
    };
  },
  toHaveErrorMessage(
    response: Response,
    code: number,
    message: string,
    bodyMessage: string | string[],
  ): CustomMatcherResult {
    if (response.type !== 'application/json') {
      return {
        pass: false,
        message: (): string =>
          `Expected 'application/json' response type, got ${response.type}`,
      };
    }

    if (response.status !== code) {
      return {
        pass: false,
        message: (): string =>
          `Expected "${code}" response error code, got "${response.status}"`,
      };
    }

    if (response.body.errors[0].status.toString() !== code.toString()) {
      return {
        pass: false,
        message: (): string =>
          `Expected "${code}" response body error code, got "${response.body.errors[0].status}"`,
      };
    }

    if (response.body.errors[0].title !== message) {
      return {
        pass: false,
        message: (): string =>
          `Expected "${message}" error message, got "${response.body.errors[0].title}"`,
      };
    }

    if (Array.isArray(bodyMessage)) {
      if (
        !isEqual(
          response.body.errors[0].meta.rawError.response.message.sort(),
          bodyMessage.sort(),
        )
      ) {
        return {
          pass: false,
          message: (): string =>
            `Expected "${bodyMessage}" response error body message, got "${response.body.errors[0].meta.rawError.response.message}"`,
        };
      }
    } else {
      if (
        !isEqual(
          response.body.errors[0].meta.rawError.response.message,
          bodyMessage,
        )
      ) {
        return {
          pass: false,
          message: (): string =>
            `Expected "${bodyMessage}" response error body message, got "${response.body.errors[0].meta.rawError.response.message}"`,
        };
      }
    }

    return {
      pass: true,
      message: (): string => `ok`,
    };
  },
  toHaveJSONAPIAttributes(
    response: Response,
    expectedAttributes: string[],
  ): CustomMatcherResult {
    if (response.type !== 'application/json') {
      return {
        pass: false,
        message: (): string =>
          `Expected 'application/json' response type, got ${response.type}`,
      };
    }

    if (response.status >= 400) {
      return {
        pass: false,
        message: (): string => `Got response error code "${response.status}"`,
      };
    }

    if (!response?.body?.data) {
      return {
        pass: false,
        message: (): string => `Response body is missing the JSONAPI structure`,
      };
    }

    let responseElements: Record<string, any>[] = response.body.data;
    if (!Array.isArray(responseElements)) {
      responseElements = [responseElements];
    }

    try {
      responseElements.forEach((responseElement: Record<string, any>) => {
        const responseAttributes: string[] = Object.keys(
          responseElement.attributes,
        );

        const differentKeys: string[] = xor(
          responseAttributes,
          expectedAttributes,
        );
        if (differentKeys.length) {
          throw new Error(
            `JSON API attributes mismatch: Expected attributes: ${expectedAttributes.join(
              ', ',
            )}. Received attributes: ${differentKeys.join(
              ', ',
            )}. Different keys: ${differentKeys}`,
          );
        }
      });
    } catch (e) {
      return {
        pass: false,
        message: (): string => (e as Error).message,
      };
    }

    return {
      pass: true,
      message: (): string => `ok`,
    };
  },
});

export {};
