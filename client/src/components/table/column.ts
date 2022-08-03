import type { AccessorFn, ColumnDef, RowData } from '@tanstack/react-table';
import type { HTMLAttributes } from 'react';
declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isSticky?: boolean;
    align?: 'left' | 'right' | 'center';
    title?: string;
    format?: (value: TValue) => React.ReactNode;
  }
}

export type ColumnDefinition<T, C = T, F = React.ReactNode> = Omit<
  ColumnDef<T, C>,
  'accesorKey'
> & {
  id: string;
  fieldAccessor?: AccessorFn<T, C>;
  isSticky?: boolean;
  align?: 'left' | 'right' | 'center';
  title?: string;
  format?: (value: C) => F;
} & Pick<HTMLAttributes<HTMLDivElement>, 'className'>;
