export type Scenario = {
  id: string;
  title: string;
  description?: string;
  updatedAt?: date;
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
