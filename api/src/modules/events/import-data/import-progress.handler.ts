import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ImportProgressUpdateEvent } from 'modules/events/import-data/import-progress.event';
import { ImportProgressSocket } from 'modules/events/import-data/import-progress.socket';
import { ImportProgressPayload } from 'modules/events/import-data/types';

@EventsHandler(ImportProgressUpdateEvent)
export class ImportProgressHandler
  implements IEventHandler<ImportProgressUpdateEvent>
{
  logger: Logger = new Logger(ImportProgressHandler.name);

  constructor(private readonly importProgressSocket: ImportProgressSocket) {}

  handle(event: ImportProgressUpdateEvent): void {
    this.logger.debug(`Handling event: ${JSON.stringify(event)}`);
    const payload: ImportProgressPayload = event.payload;
    this.importProgressSocket.emitProgressUpdateToSocket(payload);
  }
}
