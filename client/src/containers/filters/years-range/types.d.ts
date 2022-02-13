export type YearsRangeParams = {
  startYear: number;
  endYear: number;
};

export type YearsRangeFilterProps = YearsRangeParams & {
  years: number[];
  fiveYearGap?: boolean;
  onChange?: ({ startYear, endYear }: YearsRangeParams) => void;
};

export type UseYearsRangeProps = Partial<YearsRangeParams> & {
  setStartYear?: (startYear: number) => void;
  setEndYear?: (endYear: number) => void;
  setYearsRange?: ({ startYear, endYear }: YearsRangeParams) => void;
};
