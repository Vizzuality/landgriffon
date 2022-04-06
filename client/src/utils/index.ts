/**
 * @param bytes Bytes to convert to Megabytes.
 * @returns Megabytes
 */
export const bytesToMegabytes = (bytes: number): number => {
  return bytes / 1000000;
};

export const listElementsJoiner = (list: string[]) =>
  list.reduce((p, d, i) => p + (i === list.length - 1 ? ' and ' : ', ') + d);
