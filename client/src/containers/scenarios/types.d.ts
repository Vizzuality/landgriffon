export type Scenario = {
  id: string;
  title: string;
  description?: string;
  updatedAt?: Date;
  scenarioInterventions?: Intervention[];
  // ! this property might change in the future as it is not defined in the API yet
  visibility?: 'public' | 'private';
};

export type ScenarioFormData = {
  id?: Scenario['id'];
  title: Scenario['title'];
  description?: Scenario['description'];
  visibility: boolean;
};

export type ScenarioDTO = {
  id?: Scenario['id'];
  title: Scenario['title'];
  description?: Scenario['description'];
  visibility?: Scenario['visibility'];
};

export type Scenarios = Scenario[];

export type ScenarioInterventionsGrowthItem = Readonly<{
  id: number;
  title: string;
}>;

export type ScenarioInterventionsGrowthItems = Readonly<{
  items: ScenarioInterventionsGrowthItem[];
}>;

export type Intervention = Readonly<{
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  status: string;
  type: string;
  startYear: number;
  endYear: number;
  percentage: number;
  newIndicatorCoefficients: unknown;
  scenario: Scenario;
  newMaterial: unknown;
  newBusinessUnit: unknown;
  newT1Supplier: unknown;
  newProducer: unknown;
  newGeoRegion: unknown;
  newLocationType: string;
  newLocationCountryInput: string;
  newLocationAddressInput: string;
  newMaterialTonnageRatio: number;
  updatedBy: unknown;
  updatedById: string;
}>;

export type InterventionTypes = Readonly<
  | 'Source from new supplier or location'
  | 'Switch to a new material'
  | 'Change production efficiency'
>;
