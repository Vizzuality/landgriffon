import type { ColumnMeta, RowData, ColumnDef } from '@tanstack/react-table';
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

export type ColumnDefinition<T> = ColumnDef<T> &
  ColumnMeta<T, T> &
  Pick<HTMLAttributes<HTMLDivElement>, 'className'>;
