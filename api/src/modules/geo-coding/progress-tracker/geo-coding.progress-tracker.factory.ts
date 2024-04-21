import { Injectable } from '@nestjs/common';
import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';
import { GeoCodingProgressTracker } from 'modules/geo-coding/progress-tracker/geo-coding.progress-tracker';

@Injectable()
export class GeoCodingProgressTrackerFactory {
  constructor(public readonly importProgressEmitter: ImportProgressEmitter) {
    this.importProgressEmitter = importProgressEmitter;
  }

  createTracker(geoCodeTrackingOptions: {
    totalLocations: number;
  }): GeoCodingProgressTracker {
    return new GeoCodingProgressTracker(
      this.importProgressEmitter,
      geoCodeTrackingOptions,
    );
  }
}
