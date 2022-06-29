import { IRowProps } from 'ka-table/props';

export type SummaryRowProps = IRowProps & {
  /** Whether the first column should be sticky */
  isFirstColumnSticky: boolean;
  /** First year for projected data */
  firstProjectedYear: number;
};
