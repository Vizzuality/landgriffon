export class GeoCodingError extends Error {
  validationErrors: any[] = [];

  constructor(message: string, validationErrors?: any[]) {
    super(message);
    this.name = 'GeoCoding Error';
    this.validationErrors = validationErrors ?? [];
  }
}
