export function replaceStringWhiteSpacesWithDash(
  str: string[] | string,
): string[] | string {
  const transform = (str: string): string =>
    str.replace(/\s+/g, '-').toLowerCase();
  if (Array.isArray(str)) {
    return str.map(transform);
  } else {
    return transform(str);
  }
}
