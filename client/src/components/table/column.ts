import type { ColumnDef, ColumnMeta, RequiredKeys, RowData } from '@tanstack/react-table';
import type { HTMLAttributes } from 'react';
import type { TableProps } from './component';
declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    theme: TableProps<TData>['theme'];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isSticky?: boolean | 'left' | 'right';
    align?: 'left' | 'right' | 'center';
  }
}

export type DisplayColumnDefProps<T, C> = RequiredKeys<
  Omit<ColumnDef<T, C>, 'accessorKey' | 'accessorFn'>,
  'id'
>;

export type ColumnDefinition<T = unknown, C = T> = DisplayColumnDefProps<T, C> &
  ColumnMeta<T, C> &
  Pick<HTMLAttributes<HTMLDivElement>, 'className'>;
