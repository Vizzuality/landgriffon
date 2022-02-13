export type YearsRangeParams = {
  /** Start year option in the filter */
  startYear: number;
  /** End year option in the filter */
  endYear: number;
};

export type YearsRangeFilterProps = YearsRangeParams & {
  /** Array of available years to add to the filter */
  years: number[];
  /** Whether the filter should enforce a 5 year gap between start and end years */
  fiveYearGap?: boolean;
  /** Callback when the years range is changed */
  onChange?: ({ startYear, endYear }: YearsRangeParams) => void;
};

export type UseYearsRangeProps = Partial<YearsRangeParams> & {
  /** Set the start year */
  setStartYear?: (startYear: number) => void;
  /** Set the end year */
  setEndYear?: (endYear: number) => void;
  /** Set the years range */
  setYearsRange?: ({ startYear, endYear }: YearsRangeParams) => void;
};
