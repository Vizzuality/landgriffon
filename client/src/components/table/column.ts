import type { AccessorFn, ColumnDef, ColumnMeta, RowData } from '@tanstack/react-table';
import type { HTMLAttributes } from 'react';
import type React from 'react';
declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isSticky?: boolean | 'left' | 'right';
    align?: 'left' | 'right' | 'center';
    title?: string;
    format?: (value: TValue) => React.ReactNode;
  }
}

export type ColumnDefinition<T = unknown, C = T, F = C> = Omit<ColumnDef<T, C>, 'accesorKey'> & {
  id: string;
  fieldAccessor?: AccessorFn<T, C>;
} & ColumnMeta<T, F> &
  Pick<HTMLAttributes<HTMLDivElement>, 'className'>;
