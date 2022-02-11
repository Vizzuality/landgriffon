export type YearsRangeFilterProps = {
  startYear: number;
  endYear: number;
  years: number[];
  fiveYearGap?: boolean;
  onChange?: ({ startYear, endYear }: { startYear: number; endYear: number }) => void;
};
