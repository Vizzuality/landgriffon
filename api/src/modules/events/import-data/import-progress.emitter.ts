import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ImportProgressUpdateEvent } from 'modules/events/import-data/import-progress.event';
import { ImportProgressSteps } from 'modules/events/import-data/types';

/**
 * @note: We use eventBus instead of commandBus because even tho broadcasting via websockets can be considered a command, it is not a command in the context of events. (apparently)
 */

@Injectable()
export class ImportProgressEmitter {
  public steps: Record<ImportProgressSteps, ImportProgressSteps> = {
    VALIDATING_DATA: 'VALIDATING_DATA',
    IMPORTING_DATA: 'IMPORTING_DATA',
    GEOCODING: 'GEOCODING',
    CALCULATING_IMPACT: 'CALCULATING_IMPACT',
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
}
