import type { ColumnHelper, Row, TableOptions } from '@tanstack/react-table';
import { getSortedRowModel } from '@tanstack/react-table';
import {
  getExpandedRowModel,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import classNames from 'classnames';
import Loading from 'components/loading';
import Pagination from 'components/pagination';
import PageSizeSelector from 'components/pagination/pageSizeSelector';
import React, { useCallback, useMemo } from 'react';
import type { ColumnDefinition } from './column';
import TableRow, { TableHeaderRow } from './row';

export interface TableProps<T>
  extends Omit<TableOptions<T>, 'columns' | 'getCoreRowModel' | 'pageCount'> {
  columns: ColumnDefinition<T, unknown>[];
  isLoading?: boolean;
  theme?: 'default' | 'striped';
  paginationProps?: {
    totalItems: number;
    itemNumber: number;
    showSummary?: boolean;
    pageCount?: number;
  };
}

const columnToColumnDef = <T,>(
  {
    align,
    isSticky = false,
    cell = ({ row: { original } }) => original[column.id],
    ...column
  }: ColumnDefinition<T, unknown>,
  columnHelper: ColumnHelper<T>,
) => {
  return columnHelper.display({
    ...column,
    cell,
    meta: {
      isSticky,
      align: align ?? 'center',
    },
    enableSorting: !!column.enableSorting,
  });
};

const Table = <T,>({
  paginationProps,
  data,
  columns,
  theme = 'default',
  isLoading,
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
    <div className="w-full space-y-5">
      <div className="relative w-full overflow-hidden shadow-xl rounded-2xl">
        {isLoading && (
          <div className="absolute z-40 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <Loading className="w-12 h-12" />
          </div>
        )}
        <div
          className={classNames('max-h-[65vh] overflow-auto', {
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
                // TODO: no data message?
                <tr className="h-20" />
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

      <div className="flex flex-row">
        <div className="flex items-center space-x-2 basis-1/2">
          <span className="text-sm text-gray-500">Rows per page</span>
          <PageSizeSelector onChange={onChangePageSize} pageSize={pagination.pageSize} />
        </div>

        <div className="flex-1">
          <Pagination
            showSummary={pagination.showSummary ?? true}
            totalPages={pagination.pageCount}
            totalItems={pagination.totalItems}
            numItems={pagination.itemNumber ?? pagination.pageSize}
            currentPage={pagination.pageIndex}
            onPageClick={(newPage) => {
              table.setPageIndex(newPage);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Table;
