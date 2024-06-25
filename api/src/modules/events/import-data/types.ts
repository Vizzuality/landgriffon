export type ImportProgressSteps =
  | 'VALIDATING_DATA'
  | 'IMPORTING_DATA'
  | 'GEOCODING'
  | 'CALCULATING_IMPACT';

export type ImportProgressSequence = [
  'VALIDATING_DATA',
  'GEOCODING',
  'IMPORTING_DATA',
  'CALCULATING_IMPACT',
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
