import type { ScenarioFormData, ScenarioDTO } from 'containers/scenarios/types';

export function parseScenarioFormDataToDto(scenarioFormData: ScenarioFormData): ScenarioDTO {
  const { visibility, ...restScenarioFormData } = scenarioFormData;
  return {
    ...restScenarioFormData,
    // ...{ visibility: visibility ? 'public' : 'private' },
  };
}
