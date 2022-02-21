import { ITableProps, ICellProps, ChildComponents } from 'ka-table';

import { SortingMode } from './enums';

export type ColumnProps = ICellProps & {
  type: 'line-chart';
  isSortable: boolean;
};

export interface TableProps extends ITableProps {
  className?: string;
  isLoading?: boolean;
  stickyFirstColumn?: boolean;
  childComponents?: ChildComponents;
  sortingMode?: SortingMode;
  defaultSorting?: ApiSortingType;
  onSortingChange?: func;
}

export type ApiSortingType = {
  orderBy: string;
  order: ApiSortDirection;
};
