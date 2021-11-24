export interface SingleYearFilterProps {
  loading: boolean;
  /** Current value of the filter */
  value: number;
  /** Available years */
  data: number[];
  /** Callback executed when the value is modified */
  onChange: (value: number) => void;
}
