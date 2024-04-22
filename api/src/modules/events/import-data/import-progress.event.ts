import { IEvent } from '@nestjs/cqrs';
import {
  ImportProgressPayload,
  ImportProgressSequence,
  ImportProgressSteps,
} from './types';

export class ImportProgressUpdateEvent implements IEvent {
  stepOrder: ImportProgressSequence = [
    'VALIDATING_DATA',
    'GEOCODING',
    'IMPORTING_DATA',
    'CALCULATING_IMPACT',
  ];
  payload: ImportProgressPayload;

  constructor(
    public readonly step: ImportProgressSteps,
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
    this.updatePayload(step, progress);
  }

  private updatePayload(step: ImportProgressSteps, progress: number): void {
    this.payload[step] = {
      step: step,
      status: 'processing',
      progress: progress,
    };
    this.setPreviousStepsAsCompleted(step);
  }

  private setPreviousStepsAsCompleted(step: ImportProgressSteps): void {
    // Update all previous steps to 'completed' status and 100% progress
    const currentStepIndex: number = this.stepOrder.indexOf(step);

    for (let i: number = 0; i < currentStepIndex; i++) {
      const previousStep: ImportProgressSteps = this.stepOrder[i];
      this.payload[previousStep].status = 'completed';
      this.payload[previousStep].progress = 100;
    }
  }
}
