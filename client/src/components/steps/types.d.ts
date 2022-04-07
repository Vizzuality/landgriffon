import type { InterventionTypes } from 'containers/scenarios/types';

export type Step = {
  id: number;
  slug?: string;
  title: string;
  name: string;
  value?: InterventionTypes;
  description?: string;
  status: 'complete' | 'current' | 'upcoming';
};
