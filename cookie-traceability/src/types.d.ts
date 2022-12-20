export type Ingredient = {
  id: string;
  name: string;
  Icon: typeof React.ReactElement;
  dataPath: string;
  dataFlowPath: string;
  dataLocationsPath: string;
};

export type IngredientDataItem = {
  Exporter: string;
  Importer: string;
  Volume_t: number;
  Exporter_val_t: number;
};

export type IngredientPayload = IngredientDataItem[];

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
