import type { TableOptions } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { getCoreRowModel } from '@tanstack/react-table';
import { useReactTable } from '@tanstack/react-table';
import classNames from 'classnames';
import Pagination from 'components/pagination';
import PageSizeSelector from 'components/pagination/pageSizeSelector';
import React, { useCallback, useMemo } from 'react';
import Cell, { HeaderCell } from './cell';
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
      footer: null,
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
              return (
                <Cell
                  className={classNames({
                    'text-left': column.align === 'left',
                    'text-center': !column.align || column.align === 'center',
                    'text-right': column.align === 'right',
                  })}
                >
                  {column.format ? column.format(value) : value}
                </Cell>
              );
            }
            return (
              <Cell maxWidth={column.maxWidth} width={column.width}>
                {column.render(cell)}
              </Cell>
            );
          },
          header: () => (
            <HeaderCell
              className={classNames({
                'text-left': column.align === 'left',
                'text-center': !column.align || column.align === 'center',
                'text-right': column.align === 'right',
              })}
            >
              {column.title}
            </HeaderCell>
          ),
          ...column,
        },
      );
    }),
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
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="sticky top-0 pl-5 border-b border-b-gray-300 bg-gray-50"
                      key={header.id}
                      style={{ width: header.column.getSize() }}
                    >
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
                <tr className="odd:bg-white even:bg-gray-50 hover:bg-gray-100" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="pl-5"
                      key={cell.id}
                      style={{
                        // columnWidth: cell.column.getSize(),
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th
                      className="sticky bottom-0 pl-5"
                      key={header.id}
                      style={{
                        columnWidth: header.column.getSize(),
                        width: header.column.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.footer, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
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
