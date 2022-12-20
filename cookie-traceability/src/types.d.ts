export type Ingredient = {
  id: string;
  name: string;
  Icon: typeof React.ReactElement;
  dataPath: string;
};

export type IngredientDataItem = {
  Exporter: string;
  Importer: string;
  Volume_t: number;
  Exporter_val_t: number;
};

export type IngredientPayload = IngredientDataItem[];
