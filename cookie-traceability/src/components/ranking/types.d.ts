import { Ingredient, IngredientDataItem } from 'types';

export type RankingProps = {
  ingredientId: Ingredient['id'];
};

export type CountryTradingRanking = {
  country: string;
  total: number;
  percentage: number;
}[];
