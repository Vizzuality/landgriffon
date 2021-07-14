export type ScenarioPayload =  {
  title: string;
  description?: string;
  updatedAt?: date;
}

export type Scenario = ScenarioPayload & {
  id: string | number;
};

export type Scenarios = Scenario[];
