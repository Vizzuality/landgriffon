import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { IWebSocketServiceToken } from 'modules/notifications/websockets/websockets.module';
import {
  EVENT_KINDS,
  IWebSocketService,
} from 'modules/notifications/websockets/websockets.service.interface';
import { ImportProgressUpdateEvent } from 'modules/cqrs/import-data/import-progress.event';

@EventsHandler(ImportProgressUpdateEvent)
export class ImportProgressHandler
  implements IEventHandler<ImportProgressUpdateEvent>
{
  logger: Logger = new Logger(ImportProgressHandler.name);

  constructor(
    @Inject(IWebSocketServiceToken)
    private readonly webSocketService: IWebSocketService,
  ) {}

  handle(event: ImportProgressUpdateEvent): void {
    this.logger.debug(`Handling event: ${JSON.stringify(event)}`);
    this.webSocketService.emit(EVENT_KINDS.DATA_IMPORT_PROGRESS, event);
  }
}
