export interface MultiYearFilterProps {
  loading?: boolean;
  /** Current start value of the filter */
  startValue: number;
  /** Current end value of the filter */
  endValue: number;
  /** Available years */
  data: number[];
  /** Callback executed when the start value is modified */
  onChangeStartValue: (value: number) => void;
  /** Callback executed when the end value is modified */
  onChangeEndValue: (value: number) => void;
  onSearch: (term: string) => void;
}
