import type { TableOptions } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/react-table';
import { getCoreRowModel } from '@tanstack/react-table';
import { useReactTable } from '@tanstack/react-table';
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
              return <Cell>{column.format ? column.format(value) : value}</Cell>;
            }
            return (
              <Cell maxWidth={column.maxWidth} width={column.width}>
                {column.render(cell)}
              </Cell>
            );
          },
          header: () => <HeaderCell>{column.title}</HeaderCell>,
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
    <div className="space-y-5">
      <div className="overflow-hidden shadow-xl rounded-2xl">
        <div
          className=" max-h-[50vh] overflow-auto"
          // className=" max-h-[50vh]  hover:overflow-auto "
        >
          <table
            className="table-fixed"
            // style={{
            //   width: table.getCenterTotalSize(),
            // }}
          >
            <thead className="border-b border-b-gray-300 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} style={{ width: header.column.getSize() + 10 }}>
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
                      className="w-full pr-5"
                      key={cell.id}
                      style={{ columnWidth: cell.column.getSize() + 20 }}
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
