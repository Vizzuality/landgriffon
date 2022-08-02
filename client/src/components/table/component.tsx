import type { ColumnHelper, DeepKeys, TableOptions } from '@tanstack/react-table';
import { getExpandedRowModel } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { getCoreRowModel } from '@tanstack/react-table';
import { useReactTable } from '@tanstack/react-table';
import Pagination from 'components/pagination';
import PageSizeSelector from 'components/pagination/pageSizeSelector';
import React, { useCallback, useMemo } from 'react';
import Cell, { HeaderCell } from './cell';
import type { ColumnDefinition } from './column';
import TableRow, { TableHeaderRow } from './row';

export interface TableProps<T = unknown>
  extends Omit<TableOptions<T>, 'columns' | 'getCoreRowModel'> {
  columns: ColumnDefinition<T, unknown>[];
  totalItems?: number;
  isLoading?: boolean;
}

const columnToColumnDef = <T,>(
  column: ColumnDefinition<T, unknown>,
  columnHelper: ColumnHelper<T>,
) => {
  return columnHelper.accessor(column.fieldAccessor || (column.id as DeepKeys<T>), {
    ...column,
    meta: {
      isSticky: column.isSticky || false,
      align: column.align || 'center',
      title: column.title || column.id,
      format: column.format,
    },
    cell: (cell) => {
      const value = cell.getValue();
      return (
        <Cell {...column} align={column.align} context={cell}>
          {value}
        </Cell>
      );
    },
    header: (context) => (
      <HeaderCell align={column.align} {...column} context={context}>
        {column.title || column.id}
      </HeaderCell>
    ),
    enableSorting: !!column.enableSorting,
  });
};

const Table = <T,>({ totalItems, data, columns, ...options }: TableProps<T>) => {
  const columnHelper = useMemo(() => createColumnHelper<T>(), []);

  const columnDefs = useMemo(
    () => columns.map((column) => columnToColumnDef(column, columnHelper)),
    [columnHelper, columns],
  );

  const table = useReactTable({
    data,
    // TODO: maybe don't set this defaults? Looks like we're going to use the API everywhere for this
    manualPagination: true,
    manualSorting: true,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    defaultColumn: {
      cell: (info) => info.getValue(),
      header: (info) => <span className="capitalize">{info.header.column.id}</span>,
      footer: null,
    },
    columns: columnDefs,
    ...options,
  });

  const { pagination } = table.getState();
  const onChangePageSize = useCallback(
    (newSize: number) => {
      table.setPageSize(newSize);
    },
    [table],
  );

  return (
    <div className="mt-5 space-y-5">
      <div className="overflow-hidden shadow-xl rounded-2xl">
        <div className=" max-h-[50vh] overflow-auto">
          <table
            className="border-separate table-fixed border-spacing-0"
            style={{
              width: table.getTotalSize(),
            }}
          >
            <thead className="border-b border-b-gray-300 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableHeaderRow key={headerGroup.id} headerGroup={headerGroup} />
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-row justify-between">
        <PageSizeSelector onChange={onChangePageSize} pageSize={pagination.pageSize} />
        <Pagination
          totalPages={table.getPageCount()}
          totalItems={totalItems}
          numItems={pagination.pageSize}
          currentPage={pagination.pageIndex}
          onPageClick={(newPage) => {
            table.setPageIndex(newPage);
          }}
        />
      </div>
    </div>
  );
};

export default Table;
