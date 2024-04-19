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
export class ImportProgressEmitter {
  public eventKinds: Record<string, string> = {
    DATA_IMPORT_PROGRESS: 'DATA_IMPORT_PROGRESS',
  };
  public steps: Record<IMPORT_PROGRESS_STATUS, string> = {
    VALIDATING_DATA: 'VALIDATING_DATA',
    IMPORTING_DATA: 'IMPORTING_DATA',
    GEOCODING: 'GEOCODING',
    CALCULATING_IMPACT: 'CALCULATING_IMPACT',
    FINISHED: 'FINISHED',
    FAILED: 'FAILED',
  };

  constructor(private readonly eventBus: EventBus) {}

  emitValidationProgress(importProgress: {
    taskId?: string;
    progress: number;
  }): void {
    this.eventBus.publish(
      new ImportProgressUpdateEvent(
        this.steps.VALIDATING_DATA,
        importProgress.progress,
      ),
    );
  }

  emitImportProgress(importProgress: {
    taskId?: string;
    progress: number;
  }): void {
    this.eventBus.publish(
      new ImportProgressUpdateEvent(
        this.steps.IMPORTING_DATA,
        importProgress.progress,
      ),
    );
  }

  emitGeocodingProgress(importProgress: {
    taskId?: string;
    progress: number;
  }): void {
    this.eventBus.publish(
      new ImportProgressUpdateEvent(
        this.steps.GEOCODING,
        importProgress.progress,
      ),
    );
  }

  emitImpactCalculationProgress(importProgress: {
    taskId?: string;
    progress: number;
  }): void {
    this.eventBus.publish(
      new ImportProgressUpdateEvent(
        this.steps.CALCULATING_IMPACT,
        importProgress.progress,
      ),
    );
  }

  emitImportFinished(): void {
    this.eventBus.publish(
      new ImportProgressUpdateEvent(this.eventKinds.FINISHED, 100),
    );
  }

  emitImportFailed(): void {
    this.eventBus.publish(
      new ImportProgressUpdateEvent(this.eventKinds.CALCULATING_IMPACT, 100),
    );
  }
}
