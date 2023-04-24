import { z, ZodObject } from "zod";
import { initContract } from "@ts-rest/core";
import { IScenario } from "./scenario.interface";

const c = initContract();

export interface IIntervention {
  id: string;
}

export interface ICreateScenarioDto {
  title: string;
  description?: string;
  isPublic: boolean;
  status: string; // todo this should be an enum
}

// TODO: Check how to infer type to ZodObject
const ScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  status: z.string(),
  metadata: z.string().optional(),
  scenarioInterventions: z.array(z.string()),
});

const CreateScenarioSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean(),
  status: z.string(),
});

export const ScenarioContract = c.router({
  createScenario: {
    method: "POST",
    path: "/api/v1/scenarios_e2e_test",
    //     ^ Note! This is the full path on the server, not just the sub-path of a route
    responses: {
      201: ScenarioSchema,
    },
    body: CreateScenarioSchema,
    summary: "Create a scenario test",
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

const test = ScenarioContract.createScenario;
