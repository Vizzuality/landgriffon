import {
  getSortedRowModel,
  getExpandedRowModel,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';

import TableRow, { TableHeaderRow } from './row';

import Loading from 'components/loading';
import Pagination from 'components/table/pagination';

import type { ColumnDefinition } from './column';
import type { ColumnHelper, Row, TableOptions, DeepValue, DeepKeys } from '@tanstack/react-table';

export interface TableProps<T>
  extends Omit<TableOptions<T>, 'columns' | 'getCoreRowModel' | 'pageCount'> {
  columns: ColumnDefinition<T>[];
  isLoading?: boolean;
  theme?: 'default' | 'striped';
  paginationProps?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    pageSizes?: number[];
  };
  noDataMessage?: React.ReactNode;
}

const columnToColumnDef = <T,>(
  { align = 'center', isSticky = false, id, className: ignored, ...column }: ColumnDefinition<T>,
  columnHelper: ColumnHelper<T>,
) => {
  const cell =
    column.cell ??
    (({ row: { original } }) => original[id as keyof typeof original] as DeepValue<T, typeof id>);

  return columnHelper.accessor<DeepKeys<T>, DeepValue<T, DeepKeys<T>>>(
    id as DeepKeys<T>,
    {
      enableSorting: false,
      ...column,
      cell,
      meta: {
        isSticky,
        align,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  );
};

const ComposedTable = <T,>({
  paginationProps,
  data,
  columns,
  theme = 'default',
  isLoading,
  noDataMessage = 'No data',
  ...options
}: TableProps<T>) => {
  const columnHelper = useMemo(() => createColumnHelper<T>(), []);

  const columnDefs = useMemo(
    () => columns.map((column) => columnToColumnDef(column, columnHelper)),
    [columnHelper, columns],
  );

  const table = useReactTable({
    data,
    manualPagination: true,
    manualSorting: true,
    enableSorting: true,
    enableMultiSort: false,
    enableRowSelection: true,
    enableSubRowSelection: true,
    enableMultiRowSelection: true,
    meta: {
      theme,
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columns: columnDefs,
    ...options,
  });

  const { pagination: paginationData } = table.getState();
  const pagination = { ...paginationData, ...paginationProps };

  const onChangePageSize = useCallback(
    (newSize: number) => {
      table.setPageSize(newSize);
    },
    [table],
  );

  const handlePageChange = useCallback(
    (nextPage) => {
      table.setPageIndex(nextPage);
    },
    [table],
  );

  const expandModel = table.getExpandedRowModel();

  const allExpandGroupRows = useCallback(
    (rowId: string) => {
      const topLevel = rowId.split('.')[0];
      return expandModel.flatRows.filter((subRow) => subRow.id.split('.')[0] === topLevel);
    },
    [expandModel.flatRows],
  );

  const handleRowSelection = useCallback(
    (row: Row<T>) => {
      const groupRows = allExpandGroupRows(row.id);
      table.setRowSelection(Object.fromEntries(groupRows.map((row) => [row.id, true])));
    },
    [allExpandGroupRows, table],
  );

  const bodyRows = table.getExpandedRowModel().rows;

  return (
    <div className="space-y-6">
      <div className="relative shadow-xl rounded-2xl">
        {isLoading && (
          <div className="absolute z-40 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <Loading className="w-5 h-5 text-navy-400" />
          </div>
        )}
        <div
          className={classNames('overflow-x-auto', {
            'blur-sm pointer-events-none': isLoading,
          })}
        >
          <table className="w-full border-separate table-fixed border-spacing-0">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableHeaderRow key={headerGroup.id} headerGroup={headerGroup} />
              ))}
            </thead>
            <tbody>
              {bodyRows.length === 0 && (
                <tr className="">
                  <td colSpan={table.getAllColumns().length}>
                    <p className="py-16 text-sm text-center">{noDataMessage}</p>
                  </td>
                </tr>
              )}
              {bodyRows.map((row) => {
                const groupRows = expandModel.rows.filter(
                  (other) => row.id.split('.')[0] === other.id.split('.')[0],
                );

                const isLastRow = groupRows[groupRows.length - 1].id === row.id;

                return (
                  <TableRow
                    isLast={isLastRow}
                    onClick={() => {
                      handleRowSelection(row);
                    }}
                    theme={table.options.meta.theme}
                    key={row.id}
                    row={row}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <Pagination
          availableSizes={pagination.pageSizes}
          pageSize={pagination.pageSize}
          onChangePageSize={onChangePageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ComposedTable;
