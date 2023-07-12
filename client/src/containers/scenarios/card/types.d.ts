import type { Scenario } from '../types';

export type ScenarioCardProps = {
  data: Scenario;
  display?: 'grid' | 'list';
  canEditScenario: boolean;
  canDeleteScenario: boolean;
  onDelete: (id: string) => void;
};
