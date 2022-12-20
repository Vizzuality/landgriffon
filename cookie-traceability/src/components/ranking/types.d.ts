import { Ingredient, IngredientDataItem } from 'types';

export type RankingProps = {
  ingredientId: Ingredient['id'];
};

export type CountryTradingRanking = {
  exporter: string;
  importer: string;
  volume: number;
  percentage: number;
}[];
