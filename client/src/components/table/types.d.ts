import { ITableProps, ICellProps, ChildComponents } from 'ka-table';

import { SortingMode } from './enums';

export type ColumnProps = ICellProps & {
  /** Custom cell types */
  type: 'line-chart';
  /** Whether the column is sortable */
  isSortable: boolean;
};

export interface TableProps extends ITableProps {
  /** classNames to apply to the table */
  className?: string;
  /**
   * Whether data is currently being loaded. Will cause pagination to freeze its current state.
   * Defaults to `false`.
   * */
  isLoading?: boolean;
  /** Whether to make the first column sticky. Defaults to `true` */
  stickyFirstColumn?: boolean;
  /** ka-table childComponents */
  childComponents?: ChildComponents;
  /** ka-table sorting modes + a custom one: `Api` */
  sortingMode?: SortingMode;
  /** Default sorting time */
  defaultSorting?: ApiSortingType;
  /** Callback when sorting changes. Applicable to `Api` sorting only. */
  onSortingChange?: func;
  /** Callback to update table visible rows. */
  handleIndicatorRows?: func;
  /** Number of total indicators shown in the table. */
  total?: number;
}

export type ApiSortingType = {
  /** Field to sort by */
  orderBy: string;
  /** Sort by asc or desc */
  order: ApiSortDirection;
};
