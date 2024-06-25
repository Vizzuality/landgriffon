import { Inject } from '@nestjs/common';
import { IWebSocketServiceToken } from 'modules/notifications/websockets/websockets.module';
import { IWebSocketService } from 'modules/notifications/websockets/websockets.service.interface';
import { ImportProgressPayload } from 'modules/events/import-data/types';

export class ImportProgressSocket {
  importDataEventKind: Record<any, any> = {
    DATA_IMPORT_PROGRESS: 'DATA_IMPORT_PROGRESS',
    DATA_IMPORT_COMPLETE: 'DATA_IMPORT_COMPLETED',
    DATA_IMPORT_FAILURE: 'DATA_IMPORT_FAILURE',
  };

  constructor(
    @Inject(IWebSocketServiceToken)
    private readonly websockets: IWebSocketService,
  ) {}

  emitProgressUpdateToSocket(payload: ImportProgressPayload): void {
    this.websockets.emit(
      this.importDataEventKind.DATA_IMPORT_PROGRESS,
      payload,
    );
  }

  emitImportCompleteToSocket(completedPayload: any): void {
    this.websockets.emit(
      this.importDataEventKind.DATA_IMPORT_COMPLETE,
      completedPayload,
    );
  }

  emitImportFailureToSocket(failurePayload: any): void {
    this.websockets.emit(
      this.importDataEventKind.DATA_IMPORT_FAILURE,
      failurePayload,
    );
  }
}
