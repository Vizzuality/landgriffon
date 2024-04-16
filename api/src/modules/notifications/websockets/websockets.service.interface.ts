import { Logger, OnModuleInit } from '@nestjs/common';

export enum EVENT_KINDS {
  DATA_IMPORT_PROGRESS = 'DATA_IMPORT_PROGRESS',
}

export interface IWebSocketService extends OnModuleInit {
  logger: Logger;

  emit(eventKind: EVENT_KINDS, payload: any): void;
}
