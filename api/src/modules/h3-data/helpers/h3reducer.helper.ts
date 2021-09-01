/**
 * Helper utility to reduce H3 array resultset into a single hash-map
 */
import { H3IndexValueData } from 'modules/h3-data/h3-data.entity';

export const h3Reducer = (
  h3data: Array<H3IndexValueData>,
  indexKeyName: string,
  valueKeyName: string,
): H3IndexValueData => {
  return h3data.reduce(
    (acc: any, cur: any) =>
      Object.assign(acc, { [cur[indexKeyName]]: cur[valueKeyName] }),
    {},
  );
};
