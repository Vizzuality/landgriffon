import type { TableOptions } from '@tanstack/react-table';
import { getExpandedRowModel } from '@tanstack/react-table';
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

const getAlignmentClasses = (align: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'left':
      return 'text-left';
    case 'right':
      return 'text-right';
    case 'center':
    default:
      return 'text-center';
  }
};
export interface TableProps<T> extends Omit<TableOptions<T>, 'columns' | 'getCoreRowModel'> {
  columns: ColumnDefinition<T, unknown>[];
  totalItems?: number;
}

const Table = <T extends { children?: T[] }>({
  totalItems,
  data,
  columns,
  ...options
}: TableProps<T>) => {
  const columnHelper = useMemo(() => createColumnHelper<T>(), []);
  const table = useReactTable({
    data,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
          meta: {
            isSticky: column.isSticky || false,
          },
          cell: (cell) => {
            let children: string | React.ReactNode;
            if (isRawColumn(column)) {
              const value = cell.getValue();
              children = column.format ? column.format(value) : value;
            } else {
              children = column.render(cell);
            }

            return (
              <Cell context={cell} className={getAlignmentClasses(column.align)}>
                {children}
              </Cell>
            );
          },
          header: (context) => (
            <HeaderCell context={context} className={getAlignmentClasses(column.align)}>
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
                      className={classNames('sticky top-0 border-b border-b-gray-300 bg-gray-50', {
                        'left-0 z-10': header.column.columnDef.meta.isSticky,
                      })}
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
                <tr className="group" key={row.id}>
                  {row.getVisibleCells().map((cell, i) => (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                      }}
                      className={classNames(
                        'group-odd:bg-white group-even:bg-gray-50 group-hover:bg-gray-100',
                        {
                          'sticky left-0 z-10 border-r': cell.column.columnDef.meta.isSticky,
                        },
                      )}
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
