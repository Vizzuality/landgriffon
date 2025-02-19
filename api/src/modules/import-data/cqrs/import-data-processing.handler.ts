import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { Logger } from '@nestjs/common';
import {
  IMPORT_DATA_EVENTS,
  ImportDataEvent,
} from 'modules/events/import-data-events/import-data.event-handler';

export class StartImportProcessingCommand {
  constructor(
    public readonly taskId: string,
    public readonly xlsxFileData: Express.Multer.File,
  ) {}
}

@CommandHandler(StartImportProcessingCommand)
export class StartImportProcessingHandler
  implements ICommandHandler<StartImportProcessingCommand>
{
  private readonly logger = new Logger(StartImportProcessingHandler.name);

  constructor(
    private readonly importDataService: ImportDataService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: StartImportProcessingCommand): Promise<void> {
    const { taskId, xlsxFileData } = command;
    // Optionally publish an event to mark the import as "Started"
    // this.eventBus.publish(...);
    this.eventBus.publish(
      new ImportDataEvent(taskId, IMPORT_DATA_EVENTS.STARTED, {
        file: xlsxFileData.originalname,
      }),
    );

    // Now do the actual heavy lifting here
    await this.importDataService.processImportJob(taskId, xlsxFileData);

    // Optionally publish a "Finished" event or let OnQueueCompleted handle that
  }
}
