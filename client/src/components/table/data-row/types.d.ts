import { IRowProps } from 'ka-table/props';

import { Column } from 'ka-table/models';

interface CustomColumn extends Column {
  isFirstYearProjected?: boolean;
}

interface CustomIRowProps extends IRowProps {
  columns: CustomColumn[];
}

export type DataRowProps = Partial<Omit<IRowProps, 'columns'>> & {
  /** Key of the first column */
  firstColumnKey: string;
  /** Whether the first column should be sticky (when scrolling horizontally) */
  isFirstColumnSticky: boolean;
  stickyColumnKey: string;
  columns: CustomColumn[];
};
