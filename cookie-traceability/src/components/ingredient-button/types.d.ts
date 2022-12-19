import type { Ingredient } from 'types';

export type IngredientButtonProps = React.ButtonHTMLAttributes & {
  current?: Ingredient.id;
  icon: React.ReactElement;
};
