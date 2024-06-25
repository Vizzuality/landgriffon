import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';

export class GeoCodingProgressTracker {
  totalLocations: number;
  processedLocations: number = 0;

  constructor(
    public readonly importProgressEmitter: ImportProgressEmitter,
    trackingOptions: {
      totalLocations: number;
    },
  ) {
    this.importProgressEmitter = importProgressEmitter;
    this.totalLocations = trackingOptions.totalLocations;
  }

  trackProgress(): void {
    this.processedLocations++;

    this.importProgressEmitter.emitGeocodingProgress({
      progress: this.getProgress(),
    });
  }

  private getProgress(): number {
    return (this.processedLocations / this.totalLocations) * 100;
  }
}
