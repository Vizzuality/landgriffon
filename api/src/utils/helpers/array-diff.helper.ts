export const getDiffForEntitiesToBeActivated = (
  codesForActivateElements: string[],
  actualElementsInDB: string[],
): string[] =>
  codesForActivateElements.filter(
    (elementCode: string) => !actualElementsInDB.includes(elementCode),
  );
