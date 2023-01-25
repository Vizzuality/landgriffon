import type { SelectProps } from 'components/forms/select';

export type YearsRangeParams = {
  /** Start year option in the filter */
  startYear: number;
  /** End year option in the filter */
  endYear: number;
};

export type YearsRangeFilterProps = YearsRangeParams & {
  /** Whether the data is still loading. Defaults to `false` */
  loading?: boolean;
  /** Array of available years to add to the filter */
  years: number[];
  /** Enforce N years gap between startYear and endYear */
  yearsGap?: number;
  /**
   * Whether to show the search field for the start year select.
   * Defaults to `false`
   * */
  showStartYearSearch?: boolean;
  /**
   * Whether to show the search field for the start year select.
   * Defaults to `true`
   * */
  showEndYearSearch?: boolean;
  /**
   * Whether to show the search field for both start and end year select.
   * Overrides `showStartYearSearch` and `showEndYearSearch`
   * */
  showSearch?: boolean;
  /** Callback when the years range is changed */
  onChange?: ({ startYear, endYear }: YearsRangeParams) => void;
  /** Callback when the start year is searched */
  onStartYearSearch?: SelectProps['onSearch'];
  /** Callback when the end year is searched */
  onEndYearSearch?: SelectProps['onSearch'];
  /** Last year with avaliable data. Years greater than this will have the message `projected data` */
  lastYearWithData?: number;
  /** placeholder used in the the first select */
  placeholderFrom?: string;
  /** placeholder used in the the second select */
  placeholderTo?: string;
};

export type UseYearsRangeProps = Partial<YearsRangeParams> & {
  /** Array of all available years */
  years?: number[];
  /** Array of years in the range specified */
  yearsInRange?: number[];
  /** Enforce N years gap between startYear and endYear */
  yearsGap?: number;
  /**
   * Whether to validate the set startYear/endYear fall within the years array range.
   * Defaults to `true`
   * */
  validateRange?: boolean;
  /** Set the start year */
  setStartYear?: (startYear: number) => void;
  /** Set the end year */
  setEndYear?: (endYear: number) => void;
  /** Set the years range */
  setYearsRange?: ({ startYear, endYear }: YearsRangeParams) => void;
};
