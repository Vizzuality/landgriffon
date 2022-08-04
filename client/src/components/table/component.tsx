import type { ColumnHelper, DeepKeys, Row, TableOptions } from '@tanstack/react-table';
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
  isLoading?: boolean;
  theme?: 'default' | 'fancy';
  paginationProps?: {
    totalItems: number;
    itemNumber: number;
    showSummary?: boolean;
  };
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
    cell: (context) => {
      const value = context.getValue();
      return (
        <Cell {...column} align={column.align} context={context}>
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

const Table = <T,>({
  paginationProps,
  data,
  columns,
  theme = 'default',
  ...options
}: TableProps<T>) => {
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
    enableRowSelection: true,
    enableSubRowSelection: true,
    enableMultiRowSelection: true,
    meta: {
      theme,
    },
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

  // for (let i = 0; i < expandModel.rows.length; ++i) {
  //   const lastRowOfGroup = expandModel.rows
  //     .reverse()
  //     .find((row) => row.id.split('.')[0] === `${i}`);
  //   console.log({ lastRowOfGroup });
  // }

  return (
    <div className="w-full mt-5 space-y-5">
      <div className="w-full overflow-hidden shadow-xl rounded-2xl">
        <div className=" max-h-[50vh] overflow-auto">
          <table
            className="w-full border-collapse table-fixed border-spacing-0"
            // style={{
            //   width: table.getTotalSize(),
            // }}
          >
            <thead className="border-b border-b-gray-300 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableHeaderRow key={headerGroup.id} headerGroup={headerGroup} />
              ))}
            </thead>
            <tbody>
              {table.getExpandedRowModel().rows.map((row) => {
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

      <div className="flex flex-row justify-between">
        <PageSizeSelector onChange={onChangePageSize} pageSize={pagination.pageSize} />
        <Pagination
          showSummary={pagination.showSummary ?? true}
          totalPages={table.getPageCount()}
          totalItems={pagination.totalItems}
          numItems={pagination.itemNumber ?? pagination.pageSize}
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
