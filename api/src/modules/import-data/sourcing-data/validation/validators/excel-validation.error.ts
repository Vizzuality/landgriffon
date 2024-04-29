export class ExcelValidationError extends Error {
  public validationErrors: any[] = [];

  constructor(message: string, validationErrors: any[] = []) {
    super(message);
    this.name = 'Validation Error in Excel File';
    this.validationErrors = validationErrors;
  }
}
