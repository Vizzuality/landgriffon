import { initQueryClient } from '@ts-rest/react-query';
import { ScenarioContract } from 'shared/scenarios/scenario.contracts';

export const scenarioClientContract = initQueryClient(ScenarioContract, {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  baseHeaders: {},
});
