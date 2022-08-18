import type { ColumnHelper, DeepKeys, Row, TableOptions } from '@tanstack/react-table';
import { getExpandedRowModel } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { getCoreRowModel } from '@tanstack/react-table';
import { useReactTable } from '@tanstack/react-table';
import classNames from 'classnames';
import Loading from 'components/loading';
import Pagination from 'components/pagination';
import PageSizeSelector from 'components/pagination/pageSizeSelector';
import React, { useCallback, useMemo } from 'react';
import Cell, { HeaderCell } from './cell';
import type { ColumnDefinition } from './column';
import TableRow, { TableHeaderRow } from './row';

export interface TableProps<T = unknown>
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
  { format, align, isSticky, fieldAccessor, ...column }: ColumnDefinition<T, unknown>,
  columnHelper: ColumnHelper<T>,
) => {
  return columnHelper.accessor(fieldAccessor || (column.id as DeepKeys<T>), {
    ...column,
    meta: {
      isSticky: isSticky || false,
      align: align || 'center',
      format,
    },
    cell: (context) => {
      const value = context.getValue() as React.ReactNode;
      return (
        <Cell {...column} align={align} context={context}>
          {value}
        </Cell>
      );
    },
    header: (context) => (
      <HeaderCell align={align} {...column} context={context}>
        {column.title ?? column.id}
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
            <thead className="border-b border-b-gray-300 bg-gray-50">
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

      <div className="flex flex-row justify-between">
        <PageSizeSelector onChange={onChangePageSize} pageSize={pagination.pageSize} />
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
  );
};

export default Table;
