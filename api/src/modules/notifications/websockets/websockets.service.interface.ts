import { Logger, OnModuleInit } from '@nestjs/common';
import { EVENT_KINDS } from './types';

export interface IWebSocketService extends OnModuleInit {
  logger: Logger;

  emit(eventKind: EVENT_KINDS, payload: any): void;
}
