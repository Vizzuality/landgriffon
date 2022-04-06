import { IRowProps } from 'ka-table/props';

export type DataRowProps = IRowProps & {
  firstColumnKey: string;
  isFirstColumnSticky: boolean;
  stickyColumnKey: string;
};
