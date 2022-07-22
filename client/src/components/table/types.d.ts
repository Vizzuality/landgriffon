import type { ITableProps, ICellProps } from 'ka-table';
import type { ChildComponents, Column as KaColumn, PagingOptions } from 'ka-table/models';

import type { DataType, SortingMode } from './enums';

export type ColumnProps = ICellProps & {
  /** Custom cell types */
  type: 'line-chart';
  /** Whether the column is sortable */
  isSortable: boolean;
};

import type { Column } from 'ka-table/models';
import type { IHeadCellProps } from 'ka-table/props';

interface CustomColumn extends Column {
  isFirstYearProjected?: boolean;
}

export interface CustomHeadCell extends Omit<IHeadCellProps, 'column'> {
  column: CustomColumn;
}

export interface CustomChildComponents extends ChildComponents {
  headCell?: ChildComponent<CustomHeadCell>;
}

export type Column = Omit<KaColumn, 'dataType'> & {
  dataType?: DataType;
};
export interface TableProps extends Omit<ITableProps, 'paging' | 'columns'> {
  /** classNames to apply to the table */
  className?: string;
  paging?: PagingOptions & {
    totalItems?: number;
  };

  columns: Column[];
  /**
   * Whether data is currently being loaded. Will cause pagination to freeze its current state.
   * Defaults to `false`.
   * */
  isLoading?: boolean;
  /** Whether to make the first column sticky. Defaults to `true` */
  stickyFirstColumn?: boolean;
  /** ka-table childComponents */
  childComponents?: CustomChildComponents;
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
  pageNumber?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export type ApiSortingType = {
  /** Field to sort by */
  orderBy: string;
  /** Sort by asc or desc */
  order: ApiSortDirection;
};
