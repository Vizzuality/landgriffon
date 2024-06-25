import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';

export class ValidationProgressTracker {
  totalSteps: number;
  progress: number = 0;

  constructor(
    public readonly importProgressEmitter: ImportProgressEmitter,
    trackingOptions: {
      totalSteps: number;
    },
  ) {
    this.importProgressEmitter = importProgressEmitter;
    this.totalSteps = trackingOptions.totalSteps;
  }

  trackProgress(): void {
    this.progress++;

    this.importProgressEmitter.emitValidationProgress({
      progress: this.getProgress(),
    });
  }

  private getProgress(): number {
    return (this.progress / this.totalSteps) * 100;
  }
}
