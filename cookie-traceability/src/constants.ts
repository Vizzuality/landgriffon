import CocoaIcon from 'components/icons/cocoa';
import WheatIcon from 'components/icons/wheat';
import PalmOilIcon from 'components/icons/palm-oil';
import ButterIcon from 'components/icons/butter';

import type { Ingredient } from 'types';

export const INGREDIENTS: Ingredient[] = [
  {
    id: 'cocoa',
    name: 'Cocoa',
    Icon: CocoaIcon,
  },
  {
    id: 'wheat',
    name: 'Wheat',
    Icon: WheatIcon,
  },
  {
    id: 'palm-oil',
    name: 'Palm oil',
    Icon: PalmOilIcon,
  },
  {
    id: 'butter',
    name: 'Butter',
    Icon: ButterIcon,
  },
];
