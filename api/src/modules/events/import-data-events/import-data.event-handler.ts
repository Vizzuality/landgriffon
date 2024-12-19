import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { API_EVENT_KINDS } from 'modules/api-events/api-event.entity';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import { Task } from 'modules/tasks/task.entity';

export enum IMPORT_DATA_EVENTS {
  started = API_EVENT_KINDS.data__importStarted__v1alpha1,
  failed = API_EVENT_KINDS.data__importFailed__v1alpha1,
  succeeded = API_EVENT_KINDS.data__importSucceeded__v1alpha1,
}

export class ImportDataEvent implements IEvent {
  constructor(
    public readonly taskId: Task['id'],
    public readonly kind: IMPORT_DATA_EVENTS,
    public readonly payload: any,
  ) {}
}

@EventsHandler(ImportDataEvent)
export class ImportDataEventHandler implements IEventHandler<ImportDataEvent> {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async handle(event: ImportDataEvent): Promise<void> {
    await this.apiEvents.create({
      topic: event.taskId,
      kind: event.kind as unknown as API_EVENT_KINDS,
      data: event.payload,
    });
  }
}
