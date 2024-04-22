import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';

export class SourcingDataImportProgressTracker {
  totalRecords: number;
  progress: number = 0;
  progressPerChunk: number;

  constructor(
    private readonly importProgressEmitter: ImportProgressEmitter,
    private readonly importTrackInfo: {
      totalRecords: number;
      totalChunks: number;
    },
  ) {
    this.importProgressEmitter = importProgressEmitter;
    this.totalRecords = importTrackInfo.totalRecords;
    this.progressPerChunk = (100 - 50) / importTrackInfo.totalChunks;
  }

  trackProgress(): void {
    this.progress += this.progressPerChunk;

    this.importProgressEmitter.emitGeocodingProgress({
      progress: this.getProgress(),
    });
  }

  private getProgress(): number {
    return this.progress;
  }
}
