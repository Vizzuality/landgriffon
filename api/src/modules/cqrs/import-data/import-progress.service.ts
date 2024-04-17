import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import {
  IMPORT_PROGRESS_STATUS,
  ImportProgressUpdateEvent,
} from 'modules/cqrs/import-data/import-progress.event';

/**
 * @note: We use eventBus instead of commandBus because even tho broadcasting via websockets can be considered a command, it is not a command in the context of cqrs. (apparently)
 */

@Injectable()
export class ImportProgressService {
  eventKinds: Record<string, string> = {
    DATA_IMPORT_PROGRESS: 'DATA_IMPORT_PROGRESS',
  };

  constructor(
    // @Inject(IWebSocketServiceToken) private service: IWebSocketService,
    private readonly eventBus: EventBus,
  ) {}

  emitUpdateProgress(
    taskId: string,
    status: IMPORT_PROGRESS_STATUS,
    progress: number,
  ): void {
    this.eventBus.publish(
      new ImportProgressUpdateEvent(
        taskId,
        this.eventKinds.DATA_IMPORT_PROGRESS,
        status,
        progress,
      ),
    );
  }
}
