import CustomMatcherResult = jest.CustomMatcherResult;
import { Response } from 'supertest';
import { isEqual, xor } from 'lodash';

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
    }
  }
}

expect.extend({
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
        message: (): string => e.message,
      };
    }

    return {
      pass: true,
      message: (): string => `ok`,
    };
  },
});

export {};
