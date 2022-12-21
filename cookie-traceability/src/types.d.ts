export type Ingredient = {
  id: string;
  name: string;
  rankingKey: string;
  dataPath: string;
  dataFlowPath: string;
  dataLocationsPath: string;
};

export type IngredientDataItem = {
  Exporter: string;
  Importer: string;
  Value: number;
};

export type IngredientPayload = Record<string, IngredientDataItem[]>;

export type LocationDatum = {
  id: string;
  name: string;
  lon: number;
  lat: number;
};

export type FlowDatum = {
  origin: string;
  dest: string;
  count: number;
};

export type CountryTrade = {
  exporter: string;
  importer: string;
  volume: number;
  percentage: number;
};
