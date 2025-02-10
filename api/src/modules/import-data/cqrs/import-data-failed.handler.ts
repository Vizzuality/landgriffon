// handle-import-failed.handler.ts

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { TasksService } from 'modules/tasks/tasks.service';
import { ImportMailService } from 'modules/import-data/import-mail/import-mail.service';
import { ImportProgressSocket } from 'modules/events/import-data-progress/import-progress.socket';
import { Logger } from '@nestjs/common';
import { Task, TASK_STATUS, TASK_TYPE } from 'modules/tasks/task.entity';
import {
  ImportDataEvent,
  IMPORT_DATA_EVENTS,
} from '../../events/import-data-events/import-data.event-handler';

export class HandleImportFailedCommand {
  constructor(
    public readonly taskId: string,
    public readonly fileData: { filename: string; originalname: string },
    public readonly error: any,
  ) {}
}

@CommandHandler(HandleImportFailedCommand)
export class HandleImportFailedHandler
  implements ICommandHandler<HandleImportFailedCommand>
{
  private readonly logger = new Logger(HandleImportFailedHandler.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly importMail: ImportMailService,
    private readonly importSocket: ImportProgressSocket,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: HandleImportFailedCommand): Promise<void> {
    const { taskId, fileData, error } = command;

    // 1. Update the Task status
    const task: Task = await this.tasksService.updateImportTask({
      taskId: taskId,
      newStatus: TASK_STATUS.FAILED,
      message: error.message,
      newErrors: error.validationErrors,
    });

    // 2. Emit failure to socket
    this.importSocket.emitImportFailureToSocket({ error });

    // 3. Publish domain event to track in api_events table
    this.eventBus.publish(
      new ImportDataEvent(task.id, IMPORT_DATA_EVENTS.FAILED, {
        error: { message: error.message, stack: error.stack },
      }),
    );

    this.logger.error(
      `Import Failed for file: ${fileData.filename} for task: ${task.id}: ${error.message}`,
    );

    // TODO: If the error is not related to the file, we should not send an error report (as it will be empty), we should send a generic error message
    //       Since we are registering api events for the import now, it might be useful to include the id of the event so that the client
    //       can share it with the support team

    // 4. Send user failure email (optionally skipping if error isn't file-related)
    const errorReport: string = await this.tasksService.getTaskErrorReport(
      task.id,
      {
        type: TASK_TYPE.SOURCING_DATA_IMPORT,
      },
    );

    await this.importMail.sendImportFailureMail({
      email: task.user.email,
      fileName: fileData.originalname,
      importDate: task.createdAt,
      errorContent: errorReport,
    });
  }
}
