import { ImportProgressEmitter } from 'modules/events/import-data/import-progress.emitter';

export class ImpactCalculationProgressTracker {
  totalRecords: number;
  progress: number = 0;
  progressPerChunk: number;
  private interval: NodeJS.Timer | null = null;

  constructor(
    private readonly importProgressEmitter: ImportProgressEmitter,
    private readonly importTrackInfo: {
      totalRecords: number;
      totalChunks: number;
      startingPercentage?: number;
      estimatedTime?: number;
    },
  ) {
    this.importProgressEmitter = importProgressEmitter;
    this.totalRecords = importTrackInfo.totalRecords;
    const startingPercentage: number = importTrackInfo.startingPercentage ?? 0;
    this.progress = startingPercentage;
    this.progressPerChunk =
      (100 - startingPercentage) / importTrackInfo.totalChunks;
  }

  trackProgress(): void {
    this.progress += this.progressPerChunk;

    this.importProgressEmitter.emitImpactCalculationProgress({
      progress: this.getProgress(),
    });
  }

  private getProgress(): number {
    return this.progress;
  }

  startProgressInterval(progressIncrement: number, maxProgress: number): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.progress += progressIncrement;
      this.progress = Math.min(this.progress, maxProgress);
      this.importProgressEmitter.emitImpactCalculationProgress({
        progress: this.getProgress(),
      });

      if (this.progress >= maxProgress) {
        this.stopProgressInterval();
      }
    }, 1000);
  }

  stopProgressInterval(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
