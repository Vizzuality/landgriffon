import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { API_EVENT_KINDS, ApiEvent } from 'modules/api-events/api-event.entity';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import { Task } from 'modules/tasks/task.entity';

export enum IMPORT_DATA_EVENTS {
  STARTED = API_EVENT_KINDS.sourcing_data__importStarted__v1alpha1,
  FAILED = API_EVENT_KINDS.sourcing_data__importFailed__v1alpha1,
  SUCCEED = API_EVENT_KINDS.sourcing_data__importSucceeded__v1alpha1,
}

export class ImportDataEvent implements IEvent {
  constructor(
    public readonly taskId: Task['id'],
    public readonly kind: IMPORT_DATA_EVENTS,
    public readonly data: any,
  ) {}
}

@EventsHandler(ImportDataEvent)
export class ImportDataEventHandler implements IEventHandler<ImportDataEvent> {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async handle(event: ImportDataEvent): Promise<void> {
    const { taskId, kind, data } = event;
    await this.apiEvents.create({
      topic: taskId,
      kind: kind as unknown as API_EVENT_KINDS,
      data: data,
    });
  }
}
