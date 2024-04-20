export type ImportProgressSteps =
  | 'VALIDATING_DATA'
  | 'IMPORTING_DATA'
  | 'GEOCODING'
  | 'CALCULATING_IMPACT'
  | 'FINISHED'
  | 'FAILED';

export type ImportProgressSequence = [
  'VALIDATING_DATA',
  'IMPORTING_DATA',
  'GEOCODING',
  'CALCULATING_IMPACT',
  'FINISHED',
  'FAILED',
];

type StepStatus = 'idle' | 'processing' | 'completed';

interface StepDetail {
  step: ImportProgressSteps;
  status: StepStatus;
  progress: number;
}

export type ImportProgressPayload = {
  [key in ImportProgressSteps]: StepDetail;
};
