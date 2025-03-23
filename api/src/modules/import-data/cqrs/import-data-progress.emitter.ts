import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ImportProgressSteps } from 'modules/events/import-data-progress/types';
import { ImportDataProgressEvent } from 'modules/import-data/cqrs/import-data-progress.handler';

/**
 * @note: We use eventBus instead of commandBus because even tho broadcasting via websockets can be considered a command, it is not a command in the context of events. (apparently)
 */

@Injectable()
export class ImportDataProgressEmitter {
  public steps: Record<ImportProgressSteps, ImportProgressSteps> = {
    VALIDATING_DATA: 'VALIDATING_DATA',
    IMPORTING_DATA: 'IMPORTING_DATA',
    GEOCODING: 'GEOCODING',
    CALCULATING_IMPACT: 'CALCULATING_IMPACT',
  };

  constructor(private readonly eventBus: EventBus) {}

  emitValidationProgress(progress: number): void {
    this.eventBus.publish(
      new ImportDataProgressEvent(this.steps.VALIDATING_DATA, progress),
    );
  }

  emitImportProgress(progress: number): void {
    this.eventBus.publish(
      new ImportDataProgressEvent(this.steps.IMPORTING_DATA, progress),
    );
  }

  emitGeocodingProgress(progress: number): void {
    this.eventBus.publish(
      new ImportDataProgressEvent(this.steps.GEOCODING, progress),
    );
  }

  emitImpactCalculationProgress(progress: number): void {
    this.eventBus.publish(
      new ImportDataProgressEvent(this.steps.CALCULATING_IMPACT, progress),
    );
  }
}
