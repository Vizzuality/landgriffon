import { ITableProps, ICellProps, ChildComponents } from 'ka-table';

export type ColumnProps = ICellProps & {
  type: 'line-chart';
};

export type TableProps = ITableProps & {
  className?: string;
  stickyFirstColumn?: boolean;
  childComponents?: ChildComponents;
};
