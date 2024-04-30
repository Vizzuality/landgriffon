export class ExcelValidationError extends Error {
  // TODO: type this, should be equal to the geocoding validation error shape
  public validationErrors: any[] = [];

  constructor(message: string, validationErrors: any[]) {
    super(message);
    this.name = 'Validation Error in Excel File';
    this.validationErrors = validationErrors;
  }
}
