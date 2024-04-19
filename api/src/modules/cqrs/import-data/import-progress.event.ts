import { IEvent } from '@nestjs/cqrs';

export class ImportProgressUpdateEvent implements IEvent {
  stepOrder: string[] = [
    'VALIDATING_DATA',
    'IMPORTING_DATA',
    'GEOCODING',
    'CALCULATING_IMPACT',
  ];
  payload: Record<string, any>;

  constructor(
    public readonly step: string,
    public readonly status: string,
    public readonly progress: number,
  ) {
    this.payload = {
      VALIDATING_DATA: {
        step: 'VALIDATING_DATA',
        status: 'idle',
        progress: 0,
      },
      IMPORTING_DATA: {
        step: 'IMPORTING_DATA',
        status: 'idle',
        progress: 0,
      },
      GEOCODING: {
        step: 'GEOCODING',
        status: 'idle',
        progress: 0,
      },
      CALCULATING_IMPACT: {
        step: 'CALCULATING_IMPACT',
        status: 'idle',
        progress: 0,
      },
    };
    this.updatePayload(step, status, progress);
  }

  private updatePayload(step: string, status: string, progress: number): void {
    this.payload[step] = {
      step: step,
      status: status,
      progress: progress,
    };
    // Update all previous steps to 'completed' status and 100% progress
    const currentStepIndex: number = this.stepOrder.indexOf(step);

    for (let i: number = 0; i < currentStepIndex; i++) {
      const previousStep: string = this.stepOrder[i];
      this.payload[previousStep].status = 'completed';
      this.payload[previousStep].progress = 100;
    }
  }
}

export enum IMPORT_PROGRESS_STATUS {
  VALIDATING_DATA = 'VALIDATING_DATA',
  IMPORTING_DATA = 'IMPORTING_DATA',
  GEOCODING = 'GEOCODING',
  CALCULATING_IMPACT = 'CALCULATING_IMPACT',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
}
