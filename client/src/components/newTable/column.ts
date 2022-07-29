import type { AccessorFn, CellContext, ColumnDef, DeepKeys } from '@tanstack/react-table';

export enum ColumnType {
  RawValue,
  Render,
}

type CommonColumnInfo = {
  id: string;
  title?: string;
  width?: number;
  maxWidth?: number;
};

type IdFieldNameColumn<T> = {
  id: DeepKeys<T>;
};

type PropFieldNameColumn<T> = {
  id: string;
  fieldName: DeepKeys<T>;
};

type FieldNameColumn<T> = IdFieldNameColumn<T> | PropFieldNameColumn<T>;

type FieldAccesorColumn<T, C> = {
  id: string;
  fieldAccesor: AccessorFn<T, C>;
};

type BaseColumn<T, C> = CommonColumnInfo & (FieldNameColumn<T> | FieldAccesorColumn<T, C>);

type RawColumn<T, C> = BaseColumn<T, C> & {
  type: ColumnType.RawValue;
  format: (value: C) => string;
};

type RenderColumn<T, C> = BaseColumn<T, C> & {
  type: ColumnType.Render;
  render: (info: CellContext<T, C>) => React.ReactNode;
};

export type ColumnDefinition<T, C> =
  | RawColumn<T, C>
  | (RenderColumn<T, C> & Partial<ColumnDef<T, C>>);

export const isRawColumn = <T, C>(column: ColumnDefinition<T, C>): column is RawColumn<T, C> => {
  return column.type === ColumnType.RawValue;
};

export const hasAccessorFn = <T, C>(
  column: BaseColumn<T, C>,
): column is FieldAccesorColumn<T, C> => {
  return 'fieldAccesor' in column;
};

export const isFieldNameSet = <T>(column: FieldNameColumn<T>): column is PropFieldNameColumn<T> => {
  return 'fieldName' in column;
};
