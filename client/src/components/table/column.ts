import type { AccessorFn, ColumnDef, ColumnMeta, RowData } from '@tanstack/react-table';
import type { HTMLAttributes } from 'react';
import type React from 'react';
import type { TableProps } from './component';
declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    theme: TableProps<TData>['theme'];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isSticky?: boolean | 'left' | 'right';
    align?: 'left' | 'right' | 'center';
    format?: (value: TValue) => React.ReactNode;
  }
}

export type ColumnDefinition<T = unknown, C = T, F = C> = Omit<ColumnDef<T, C>, 'accesorKey'> & {
  id: string;
  fieldAccessor?: AccessorFn<T, C>;
  title?: string;
} & ColumnMeta<T, F> &
  Pick<HTMLAttributes<HTMLDivElement>, 'className'>;
