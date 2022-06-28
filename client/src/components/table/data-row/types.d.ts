import { IRowProps } from 'ka-table/props';

export type DataRowProps = Partial<IRowProps> & {
  /** Key of the first column */
  firstColumnKey: string;
  /** Whether the first column should be sticky (when scrolling horizontally) */
  isFirstColumnSticky: boolean;

  stickyColumnKey: string;
};
