import { Ingredient, IngredientDataItem, CountryTrade } from 'types';

export type CountryTradingRanking = CountryTrade[];

export type RankingProps = {
  ingredientId: Ingredient['id'];
  onTradingFlowChange: (countryTrade: CountryTrade | null) => void;
};
