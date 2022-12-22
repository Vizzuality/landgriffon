import type { Ingredient } from 'types';

export const INGREDIENTS: Ingredient[] = [
  {
    id: 'cocoa',
    name: 'Cocoa',
    rankingKey: 'Cocoa',
    dataPath: '/where-does-my-cookie-come-from/data/cocoa_trading.json',
    dataFlowPath: '/where-does-my-cookie-come-from/data/cocoa_flows.json',
    dataLocationsPath: '/where-does-my-cookie-come-from/data/cocoa_locations.json',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    rankingKey: 'Wheat',
    dataPath: '/where-does-my-cookie-come-from/data/wheat_trading.json',
    dataFlowPath: '/where-does-my-cookie-come-from/data/wheat_flows.json',
    dataLocationsPath: '/where-does-my-cookie-come-from/data/wheat_locations.json',
  },
  {
    id: 'palm-oil',
    name: 'Palm oil',
    rankingKey: 'Palm',
    dataPath: '/where-does-my-cookie-come-from/data/palm_trading.json',
    dataFlowPath: '/where-does-my-cookie-come-from/data/palm_flows.json',
    dataLocationsPath: '/where-does-my-cookie-come-from/data/palm_locations.json',
  },
  {
    id: 'butter',
    name: 'Butter',
    rankingKey: 'Butter',
    dataPath: '/where-does-my-cookie-come-from/data/butter_trading.json',
    dataFlowPath: '/where-does-my-cookie-come-from/data/butter_flows.json',
    dataLocationsPath: '/where-does-my-cookie-come-from/data/butter_locations.json',
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
  latitude: 0,
  zoom: 1,
  bearing: 0,
  pitch: 0,
};

export const MAPBOX_TOKEN: string =
  'pk.eyJ1IjoibGFuZGdyaWZmb24iLCJhIjoiY2ttZGFnb2ZqMXB4YzJvcGg1cDl4NWx2diJ9.2y6gvQJGqso8BaNMayHzaw';
