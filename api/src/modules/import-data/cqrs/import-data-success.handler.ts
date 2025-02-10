import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { TasksService } from 'modules/tasks/tasks.service';
import { TASK_STATUS } from 'modules/tasks/task.entity';
import { ImportProgressSocket } from 'modules/events/import-data-progress/import-progress.socket';
import { ImportMailService } from 'modules/import-data/import-mail/import-mail.service';
import {
  ImportDataEvent,
  IMPORT_DATA_EVENTS,
} from '../../events/import-data-events/import-data.event-handler';
import { Logger } from '@nestjs/common';

export class HandleImportSuccessCommand {
  constructor(
    public readonly taskId: string,
    public readonly fileData: { filename: string; originalname: string },
  ) {}
}

@CommandHandler(HandleImportSuccessCommand)
export class HandleImportSuccessHandler
  implements ICommandHandler<HandleImportSuccessCommand>
{
  private readonly logger = new Logger(HandleImportSuccessHandler.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly importSocket: ImportProgressSocket,
    private readonly importMail: ImportMailService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: HandleImportSuccessCommand): Promise<void> {
    const { taskId, fileData } = command;

    // 1. Mark task as completed
    const task = await this.tasksService.updateImportTask({
      taskId,
      newStatus: TASK_STATUS.COMPLETED,
    });

    // 2. Emit success to socket
    this.importSocket.emitImportCompleteToSocket({ status: 'completed' });

    // 3. Publish success event
    this.eventBus.publish(
      new ImportDataEvent(task.id, IMPORT_DATA_EVENTS.SUCCEED, {
        file: fileData.originalname,
        userId: task.user.id,
      }),
    );

    // 4. Send success email
    await this.importMail.sendImportSuccessMail({
      email: task.user.email,
      fileName: fileData.originalname,
      importDate: task.createdAt,
    });

    this.logger.log(
      `Import Completed for file: ${fileData.filename} for task: ${task.id}`,
    );
  }
}
