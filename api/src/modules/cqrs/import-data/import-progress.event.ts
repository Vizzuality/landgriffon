export class ImportProgressUpdateEvent {
  constructor(
    public readonly taskId: string,
    public readonly kind: string,
    public readonly status: string,
    public readonly progress?: number,
  ) {}
}

export enum IMPORT_PROGRESS_STATUS {
  VALIDATING_DATA = 'VALIDATING_DATA',
  IMPORTING_DATA = 'IMPORTING_DATA',
  GEOCODING = 'GEOCODING',
  CALCULATING_IMPACT = 'CALCULATING_IMPACT',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}
