import type { AccessorFn, ColumnDef, RowData } from '@tanstack/react-table';

type RawOrRenderFields<C> =
  | { render?: undefined; format?: (value: C) => string }
  | { render: (value: C) => React.ReactNode; format?: undefined };

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isSticky?: boolean;
    align?: 'left' | 'right' | 'center';
    title?: string;
    format?: (value: TValue) => React.ReactNode;
  }
}

export type ColumnDefinition<T, C> = Omit<ColumnDef<T, C>, 'accesorKey'> & {
  id: string;
  fieldAccessor?: AccessorFn<T>;

  isSticky?: boolean;
  align?: 'left' | 'right' | 'center';
  title?: string;
} & RawOrRenderFields<C>;
