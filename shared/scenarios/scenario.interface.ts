import { StrictImplementation } from "../base.type";

export interface IScenario {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  status: string; // todo this should be an enum
  metadata?: JSON;
  scenarioInterventions: any; // todo: this should be yet another interface
  dale: boolean;
  algo: string;
}

export interface ICreateScenarioDto {
  title: string;
  description?: string;
  wops: boolean;
  wololo: string;
  david: boolean;
}
