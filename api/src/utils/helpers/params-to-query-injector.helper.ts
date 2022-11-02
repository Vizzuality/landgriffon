/**
 * @description: Utility tool to inject parameters into prepared statement for TypeORM
 */

export const paramsToQueryInjector = (
  params: string[],
  query: string,
): string => {
  while (query.includes('$')) {
    params.forEach((value: any, i: number) => {
      const index: string = '$' + (i + 1);
      if (typeof value === 'string') {
        query = query.replace(index, `${value}`);
      }
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          query = query.replace(
            index,
            value
              .map((element: any) =>
                typeof element === 'string' ? `${element}` : element,
              )
              .join(','),
          );
        } else {
          query = query.replace(index, value);
        }
      }
      if (['number', 'boolean'].includes(typeof value)) {
        query = query.replace(index, value.toString());
      }
    });
  }
  return query;
};
