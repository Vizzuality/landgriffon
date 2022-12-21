import { Ingredient, LocationDatum, FlowDatum } from 'types';

export type MapProps = {
  ingredientId: Ingredient['id'];
};

export type MapFlowData = {
  locations: LocationDatum[];
  flows: FlowDatum[];
} | null;
