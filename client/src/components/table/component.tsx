import {
  getSortedRowModel,
  getExpandedRowModel,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo } from 'react';

import TableRow, { TableHeaderRow } from './row';

import Loading from 'components/loading';
import Pagination from 'components/table/pagination';

import type { ColumnDefinition } from './column';
import type {
  ColumnHelper,
  Row,
  Table,
  TableOptions,
  DeepValue,
  DeepKeys,
} from '@tanstack/react-table';
export interface TableProps<T>
  extends Omit<TableOptions<T>, 'columns' | 'getCoreRowModel' | 'pageCount'> {
  columns: ColumnDefinition<T>[];
  isLoading?: boolean;
  headerTheme?: 'default' | 'clean';
  theme?: 'default' | 'striped';
  showPagination?: boolean;
  paginationProps?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    pageSizes?: number[];
  };
  noDataMessage?: React.ReactNode;
  handleExpandedChange?: (table: Table<T>) => void;
  firstProjectedYear?: number;
}

const columnToColumnDef = <T,>(
  { align = 'center', isSticky = false, id, className: ignored, ...column }: ColumnDefinition<T>,
  columnHelper: ColumnHelper<T>,
) => {
  const cell =
    column.cell ??
    (({ row: { original } }) => original[id as keyof typeof original] as DeepValue<T, typeof id>);

  return columnHelper.accessor(
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
  showPagination = true,
  handleExpandedChange = () => null,
  firstProjectedYear,
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
  const rowModel = table.getRowModel();

  useEffect(() => {
    handleExpandedChange(table);
  }, [rowModel, handleExpandedChange, table]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute z-40 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <Loading className="w-5 h-5 text-navy-400" />
          </div>
        )}
        <div
          className={classNames('absolute top-0 left-0 overflow-auto w-full h-full', {
            'blur-sm pointer-events-none': isLoading,
          })}
        >
          <table
            className={classNames('w-full max-h-full min-h-content table-fixed', {
              'border-spacing-0 border-separate': true,
              'mt-[24px]': !!firstProjectedYear,
            })}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => {
                return (
                  <TableHeaderRow
                    firstProjectedYear={firstProjectedYear}
                    key={headerGroup.id}
                    headerGroup={headerGroup}
                    headerTheme={options.headerTheme}
                  />
                );
              })}
            </thead>
            <tbody>
              {bodyRows.length === 0 && (
                <tr>
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
                    firstProjectedYear={firstProjectedYear}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination && (
        <div
          className={classNames('grow-0 py-4 bg-gray-100 transition-all ease-in-out duration-100')}
        >
          <Pagination
            className="justify-between"
            availableSizes={pagination.pageSizes}
            pageSize={pagination.pageSize}
            onChangePageSize={onChangePageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ComposedTable;
