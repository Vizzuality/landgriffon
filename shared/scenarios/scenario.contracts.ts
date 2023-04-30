import { z, ZodObject } from "zod";
import { initContract } from "@ts-rest/core";
import { ICreateScenarioDto, IScenario } from "./scenario.interface";

const c = initContract();

export const ScenarioContract = c.router({
  createScenario: {
    method: "POST",
    path: "/api/v1/scenarios_e2e_test",
    //     ^ Note! This is the full path on the server, not just the sub-path of a route
    responses: {
      201: c.response<IScenario>(),
    },
    body: c.body<ICreateScenarioDto>(),
    summary: "Create a scenario test",
  },
});
