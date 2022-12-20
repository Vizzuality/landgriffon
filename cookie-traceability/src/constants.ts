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
    dataPath: '/data/cocoa_trading.json',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    Icon: WheatIcon,
    dataPath: '/data/wheat_trading.json',
  },
  {
    id: 'palm-oil',
    name: 'Palm oil',
    Icon: PalmOilIcon,
    dataPath: '/data/palm_trading.json',
  },
  {
    id: 'butter',
    name: 'Butter',
    Icon: ButterIcon,
    dataPath: '/data/butter_trading.json',
  },
];

export const RANKING_COLORS = ['#638D5A', '#469DBA', '#D96E4F', '#4A6699', '#DF6E78'];

export const NUMERAL_FORMAT = '0a';
