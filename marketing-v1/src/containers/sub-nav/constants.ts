const Types = {
  Analyze: 'analyze',
  Measure: 'measure',
  Forecast: 'forecast',
};

export const NAVIGATION_LEFT = {
  [Types.Analyze]: '01 Measure',
  [Types.Measure]: '03 Forecast',
  [Types.Forecast]: '02 Analyze',
};

export const NAVIGATION_RIGHT = {
  [Types.Analyze]: '03 Forecast',
  [Types.Measure]: '02 Analyze',
  [Types.Forecast]: '01 Measure',
};

export const NAVIGATION_RIGHT_HREF = {
  [Types.Analyze]: '/services/forecast',
  [Types.Measure]: '/services/analyze',
  [Types.Forecast]: '/services/measure',
};

export const NAVIGATION_LEFT_HREF = {
  [Types.Analyze]: '/services/measure',
  [Types.Measure]: '/services/forecast',
  [Types.Forecast]: '/services/analyze',
};

export const NAVIGATION_MOBILE_LEFT = {
  [Types.Analyze]: '01',
  [Types.Measure]: '03',
  [Types.Forecast]: '02',
};

export const NAVIGATION_MOBILE_RIGHT = {
  [Types.Analyze]: '03',
  [Types.Measure]: '02',
  [Types.Forecast]: '01',
};
