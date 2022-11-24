type Range = [start: number, end: number];

export interface MatchResult {
  /** The string slice */
  value: string;
  /** Wether the value is withing the specified ranges */
  isMatch: boolean;
}

export const splitStringByRange = (
  value: string,
  [start, end]: Range,
): readonly [string, string, string] => {
  const beginning = value.slice(0, start);
  const middle = value.slice(start, end + 1);
  const rest = value.slice(end + 1);
  return [beginning, middle, rest];
};

export const splitStringByIndexes = (value: string, indexes: readonly Range[]): MatchResult[] => {
  const titleParts: MatchResult[] = [];
  let currentChunk = value;
  for (const [start, end] of indexes) {
    if (!currentChunk) break;

    // Ranges are for the whole value, so they have to be adjusted to our slice
    const diff = value.length - currentChunk.length;
    const split = splitStringByRange(currentChunk, [start - diff, end - diff]);

    titleParts.push({ value: split[0], isMatch: false }, { value: split[1], isMatch: true });
    currentChunk = split[2];
  }

  // Add the end of the match to the result
  if (!!currentChunk) {
    titleParts.push({ value: currentChunk, isMatch: false });
  }
  // Remove possible empty strings
  const cleanedUp = titleParts.filter((part) => !!part.value);

  return cleanedUp;
};
