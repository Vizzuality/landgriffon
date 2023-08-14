import type { ProfilePayload } from 'types';

export type Scenario = {
  id: string;
  title: string;
  description?: string;
  updatedAt?: Date;
  scenarioInterventions?: Intervention[];
  isPublic?: boolean;
  user?: ProfilePayload;
  updatedBy?: ProfilePayload;
};

export type ScenarioFormData = {
  id?: Scenario['id'];
  title: Scenario['title'];
  description?: Scenario['description'];
  isPublic: boolean;
};

export type ScenarioDTO = {
  id?: Scenario['id'];
  title: Scenario['title'];
  description?: Scenario['description'];
  isPublic?: Scenario['visibility'];
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

type ScenarioDisplay = 'grid' | 'list';

export type ScenarioInterventionProps = {
  display?: ScenarioDisplay;
  scenarioId: string;
};

export type ScenarioTableProps = {
  data: Scenario[];
  className?: string;
  onDelete: (id: string) => void;
};

export type ScenarioActionsProps = {
  display: ScenarioDisplay;
  scenarioId: string;
  setDeleteVisibility: () => void;
  canDeleteScenario: boolean;
  canEditScenario: boolean;
};

export type MakePublicProps = {
  id: string;
  isPublic: boolean;
  display: ScenarioDisplay;
  canEditScenario: boolean;
};

export type GrowthRateProps = { display: ScenarioDisplay };
