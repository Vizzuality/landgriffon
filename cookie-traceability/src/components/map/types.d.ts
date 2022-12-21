import { Ingredient, LocationDatum, FlowDatum, CountryTrade } from 'types';

export type MapProps = {
  ingredientId: Ingredient['id'];
  currentTradeFlow: CountryTrade | null;
};

export type MapFlowData = {
  locations: LocationDatum[];
  flows: FlowDatum[];
} | null;
