import type { TableOptions } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { getCoreRowModel } from '@tanstack/react-table';
import { useReactTable } from '@tanstack/react-table';
import Pagination from 'components/pagination';
import React, { useMemo } from 'react';
import type { ColumnDefinition } from './column';
import { hasAccessorFn, isFieldNameSet, isRawColumn } from './column';

export interface TableProps<T> extends Omit<TableOptions<T>, 'columns' | 'getCoreRowModel'> {
  columns: ColumnDefinition<T, unknown>[];
  totalItems?: number;
}

const Table = <T,>({ totalItems, data, columns, ...options }: TableProps<T>) => {
  const columnHelper = useMemo(() => createColumnHelper<T>(), []);
  const table = useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: (info) => info.getValue(),
      header: (info) => <span className="capitalize">{info.header.column.id}</span>,
    },
    columns: columns.map((column) => {
      return columnHelper.accessor(
        hasAccessorFn(column)
          ? column.fieldAccesor
          : isFieldNameSet(column)
          ? column.fieldName
          : column.id,
        {
          id: column.id,
          cell: (cell) => {
            if (isRawColumn(column)) {
              const value = cell.getValue();
              return column.format ? column.format(value) : `${value}`;
            }
            return column.render(cell);
          },
          header: () => <span className="capitalize">{column.title}</span>,
        },
      );
    }),
    ...options,
  });

  const { pagination } = table.getState();

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <Pagination
        totalPages={table.getPageCount()}
        totalItems={totalItems}
        numItems={pagination.pageSize}
        currentPage={pagination.pageIndex}
        onPageClick={(newPage) => {
          // I don't totally understand this?
          table.setPageIndex(newPage);
        }}
      />
    </div>
  );
};

export default Table;
