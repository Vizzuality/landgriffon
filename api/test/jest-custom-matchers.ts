import CustomMatcherResult = jest.CustomMatcherResult;
import { Response } from 'supertest';
import { isEqual } from 'lodash';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveErrorMessage(
        code: number,
        message: string | string[],
      ): CustomMatcherResult;
    }
  }
}

expect.extend({
  toHaveErrorMessage(
    response: Response,
    code: number,
    message: string | string[],
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

    if (typeof message === 'string') {
      if (
        !isEqual(
          response.body.errors[0].meta.rawError.response.message,
          message,
        )
      ) {
        return {
          pass: false,
          message: (): string =>
            `Expected "${message}" response error message, got "${response.body.errors[0].meta.rawError.response.message}"`,
        };
      }
    } else {
      if (
        !isEqual(
          response.body.errors[0].meta.rawError.response.message.sort(),
          message.sort(),
        )
      ) {
        return {
          pass: false,
          message: (): string =>
            `Expected "${message}" response error message, got "${response.body.errors[0].meta.rawError.response.message}"`,
        };
      }
    }

    return {
      pass: true,
      message: (): string => `ok`,
    };
  },
});

export {};
