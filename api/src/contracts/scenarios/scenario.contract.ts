import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { CreateScenarioDto } from 'modules/scenarios_e2e_test/dto/create.scenario.dto';
import { Scenario } from 'modules/scenarios/scenario.entity';

const c = initContract();

export const ScenarioContract = c.router({
  createScenario: {
    method: 'POST',
    path: '/api/v1/scenarios_e2e_test',
    //     ^ Note! This is the full path on the server, not just the sub-path of a route
    responses: {
      201: Scenario,
    },
    body: CreateScenarioDto,
    summary: 'Create a scenario test',
  },
  // getScenarios: {
  //   method: 'GET',
  //   path: '/api/v1/scenarios_e2e_test',
  //   responses: {
  //     200: c.response<{ posts: Post[]; total: number }>(),
  //   },
  //   query: z.object({
  //     take: z.string().transform(Number).optional(),
  //     skip: z.string().transform(Number).optional(),
  //     search: z.string().optional(),
  //   }),
  //   summary: 'Get all posts',
  // },
});
