import { isObject } from 'lodash-es';
import router from 'next/router';

export const checkValidJSON = (json: string) => {
  try {
    isObject(JSON.parse(json));
    return true;
  } catch (e) {
    return false;
  }
};

export const formatParam = (param: string): string | boolean | number => {
  if (['true', 'false'].includes(param)) return param === 'true';
  if (!Number.isNaN(Number(param))) return Number(param);
  if (checkValidJSON(param)) {
    const obj = JSON.parse(param);
    if (typeof obj === 'string') return param;
    return obj;
  }
  return param;
};

export const routerReplace = async ({ queryName, queryValue, restQueries }) => {
  await router.replace(
    {
      query: {
        ...restQueries,
        ...(!!queryName
          ? {
              [queryName]: ['string', 'number'].includes(typeof queryValue)
                ? queryValue
                : checkValidJSON(JSON.stringify(queryValue))
                ? JSON.stringify(queryValue)
                : queryValue,
            }
          : {}),
      },
    },
    null,
    { shallow: true },
  );
};

export const routerReplaceMany = async (newParams, otherParams) => {
  await router.replace(
    {
      query: {
        ...otherParams,
        ...newParams,
      },
    },
    null,
    { shallow: true },
  );
};
