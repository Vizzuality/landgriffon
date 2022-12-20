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
    rankingKey: 'Cocoa',
    dataPath: '/data/cocoa_trading.json',
    dataFlowPath: '/data/cocoa_flows.json',
    dataLocationsPath: '/data/cocoa_locations.json',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    rankingKey: 'Wheat',
    Icon: WheatIcon,
    dataPath: '/data/wheat_trading.json',
    dataFlowPath: '/data/wheat_flows.json',
    dataLocationsPath: '/data/wheat_locations.json',
  },
  {
    id: 'palm-oil',
    name: 'Palm oil',
    rankingKey: 'Palm',
    Icon: PalmOilIcon,
    dataPath: '/data/palm_trading.json',
    dataFlowPath: '/data/palm_flows.json',
    dataLocationsPath: '/data/palm_locations.json',
  },
  {
    id: 'butter',
    name: 'Butter',
    rankingKey: 'Butter',
    Icon: ButterIcon,
    dataPath: '/data/butter_trading.json',
    dataFlowPath: '/data/butter_flows.json',
    dataLocationsPath: '/data/butter_locations.json',
  },
];

export const RANKING_COLORS = ['#638D5A', '#469DBA', '#D96E4F', '#4A6699', '#DF6E78'];

export const NUMERAL_FORMAT = '0a';

export const BREAKPOINTS = {
  xs: 0,

  sm: 640,
  // => @media (min-width:640 { ... }

  md: 768,
  // => @media (min-width:768 { ... }

  lg: 1024,
  // => @media (min-width:1024 { ... }

  xl: 1280,
  // => @media (min-width:1280 { ... }

  '2xl': 1536,
  // => @media (min-width: 1536px) { ... }
};

export const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 10,
  zoom: 1.3,
  bearing: 0,
  pitch: 0,
};

export const MAPBOX_TOKEN: string =
  'pk.eyJ1IjoibGFuZGdyaWZmb24iLCJhIjoiY2ttZGFnb2ZqMXB4YzJvcGg1cDl4NWx2diJ9.2y6gvQJGqso8BaNMayHzaw';
