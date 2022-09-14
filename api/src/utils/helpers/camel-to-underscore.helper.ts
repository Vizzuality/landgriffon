export const camelToSnake = (str: string): string =>
  str.replace(/[A-Z]/g, (letter: string, index: number) => {
    return index === 0 ? letter.toLowerCase() : '_' + letter.toLowerCase();
  });
