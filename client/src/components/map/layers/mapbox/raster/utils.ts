import queryString from 'query-string';

import type { ContextualLayerApiResponse } from 'hooks/layers/getContextualLayers';

export const getTiler = (
  tilerPath: ContextualLayerApiResponse['tilerUrl'],
  tilerParams: ContextualLayerApiResponse['defaultTilerParams'] = {},
): string => {
  return queryString.stringifyUrl({
    url: tilerPath.match(/^(http|https):\/\//)
      ? tilerPath
      : `${process.env.NEXT_PUBLIC_API_URL}${tilerPath}`,
    query: tilerParams,
  });
};
