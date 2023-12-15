type YearData = {
  [key: string]: string | number;
};

type indicatorField = {
  Indicator: string;
};
type DynamicGroupByField = {
  [key: `Group by ${string}`]: string;
};

export type ImpactTableCSVReport = DynamicGroupByField &
  YearData &
  indicatorField;
