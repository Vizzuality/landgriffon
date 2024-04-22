import { Injectable } from '@nestjs/common';
import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';
import { GeoCodingProgressTracker } from 'modules/geo-coding/progress-tracker/geo-coding.progress-tracker';
import { ImpactCalculationProgressTracker } from 'modules/impact/progress-tracker/impact-calculation.progress-tracker';
import { SourcingDataImportProgressTracker } from 'modules/sourcing-locations/progress-tracker/sourcing-data.progress-tracker';

@Injectable()
export class ImportProgressTrackerFactory {
  constructor(public readonly importProgressEmitter: ImportProgressEmitter) {
    this.importProgressEmitter = importProgressEmitter;
  }

  createGeoCodingTracker(geoCodeTrackingOptions: {
    totalLocations: number;
  }): GeoCodingProgressTracker {
    return new GeoCodingProgressTracker(
      this.importProgressEmitter,
      geoCodeTrackingOptions,
    );
  }

  createSourcingDataImportTracker(sourcingDataImportOptions: {
    totalRecords: number;
    totalChunks: number;
  }): SourcingDataImportProgressTracker {
    return new SourcingDataImportProgressTracker(this.importProgressEmitter, {
      totalRecords: sourcingDataImportOptions.totalRecords,
      totalChunks: sourcingDataImportOptions.totalChunks,
    });
  }

  createImpactCalculationProgressTracker(impactCalculationOptions: {
    totalRecords: number;
    totalChunks: number;
    startingPercentage?: number;
  }): ImpactCalculationProgressTracker {
    return new ImpactCalculationProgressTracker(
      this.importProgressEmitter,
      impactCalculationOptions,
    );
  }
}
