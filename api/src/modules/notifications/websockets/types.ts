export enum EVENT_KINDS {
  DATA_IMPORT_PROGRESS = 'DATA_IMPORT_PROGRESS',
}

export interface SocketPayload {
  kind: EVENT_KINDS;
  data: any;
}
