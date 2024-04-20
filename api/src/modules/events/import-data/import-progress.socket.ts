import { Inject } from '@nestjs/common';
import { EVENT_KINDS } from 'modules/notifications/websockets/types';
import { IWebSocketServiceToken } from 'modules/notifications/websockets/websockets.module';
import { IWebSocketService } from 'modules/notifications/websockets/websockets.service.interface';
import { ImportProgressPayload } from 'modules/events/import-data/types';

export class ImportProgressSocket {
  importDataEventKind: EVENT_KINDS.DATA_IMPORT_PROGRESS =
    EVENT_KINDS.DATA_IMPORT_PROGRESS;

  constructor(
    @Inject(IWebSocketServiceToken)
    private readonly websockets: IWebSocketService,
  ) {}

  emitProgressUpdateToSocket(payload: ImportProgressPayload): void {
    this.websockets.emit(this.importDataEventKind, payload);
  }
}
