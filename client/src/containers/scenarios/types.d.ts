export type ScenarioPayload = {
  title: string;
  description?: string;
  updatedAt?: date;
};

export type Scenario = ScenarioPayload & {
  id: string | number;
};

export type Scenarios = Scenario[];

export type ScenarioInterventionsGrowthItem = Readonly<{
  id: number;
  title: string;
}>;

export type ScenarioInterventionsGrowthItems = Readonly<{
  items: ScenarioInterventionsGrowthItem[];
}>;
