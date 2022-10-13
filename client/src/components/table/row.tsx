import { flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import { useMemo } from 'react';

import CellWrapper, { HeaderCell } from './cell';

import type { HTMLAttributes } from 'react';
import type { HeaderGroup, Row, TableMeta } from '@tanstack/react-table';

interface TableRowProps<T> extends HTMLAttributes<HTMLTableRowElement> {
  row: Row<T>;
  theme: TableMeta<T>['theme'];
  isLast: boolean;
}

const TableRow = <T,>({ row, theme, isLast, ...props }: TableRowProps<T>) => {
  const cells = useMemo(() => row.getVisibleCells(), [row]);
  return (
    <>
      <tr className="group" key={row.id} {...props}>
        {cells.map((cell, i) => (
          <td
            key={cell.id}
            style={{
              width: cell.column.getSize(),
            }}
            className={classNames('h-full border-transparent group-hover:bg-gray-100', {
              'border-l-4': theme === 'default' && i === 0,
              'border-l-navy-400': theme === 'default' && row.getIsSelected() && i === 0,
              'bg-white': theme === 'default',

              'group-odd:bg-white group-even:bg-gray-50': theme === 'striped',
              'sticky z-[1]': !!cell.column.columnDef.meta.isSticky,
              [theme === 'striped' ? 'shadow-lg' : 'shadow-sm']:
                !!cell.column.columnDef.meta.isSticky,
              'left-0':
                cell.column.columnDef.meta.isSticky ||
                cell.column.columnDef.meta.isSticky === 'left',
              'right-0':
                cell.column.columnDef.meta.isSticky ||
                cell.column.columnDef.meta.isSticky === 'right',
            })}
          >
            <CellWrapper context={cell.getContext()}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </CellWrapper>
          </td>
        ))}
      </tr>
      {isLast && theme !== 'striped' && <tr aria-hidden className="h-1 last:hidden"></tr>}
    </>
  );
};

interface TableHeaderRowProps<T> {
  headerGroup: HeaderGroup<T>;
}

export const TableHeaderRow = <T,>({ headerGroup }: TableHeaderRowProps<T>) => {
  return (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <th
          className={classNames('sticky z-[2] top-0 border-b-4 border-b-gray-100 bg-gray-50', {
            'left-0 z-[3]':
              header.column.columnDef.meta.isSticky ||
              header.column.columnDef.meta.isSticky === 'left',
            'right-0 z-[3]': header.column.columnDef.meta.isSticky === 'right',
          })}
          key={header.id}
          style={{ width: header.column.getSize() }}
        >
          {header.isPlaceholder ? null : (
            <HeaderCell context={header.getContext()}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </HeaderCell>
          )}
        </th>
      ))}
    </tr>
  );
};

export default TableRow;
