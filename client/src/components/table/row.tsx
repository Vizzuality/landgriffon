import type { HeaderGroup, Row, TableMeta } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

interface TableRowProps<T> extends HTMLAttributes<HTMLTableRowElement> {
  row: Row<T>;
  theme: TableMeta<T>['theme'];
  isLast: boolean;
}

const TableRow = <T,>({ row, theme, isLast, ...props }: TableRowProps<T>) => {
  return (
    <tr className={classNames('group', {})} key={row.id} {...props}>
      {row.getVisibleCells().map((cell, i) => (
        <td
          key={cell.id}
          style={{
            width: cell.column.getSize(),
          }}
          className={classNames('h-full border-l-4 border-transparent', {
            'bg-white': theme === 'fancy',
            'border-b-4': theme === 'fancy' && isLast,
            'border-l-4 border-l-green-700 box-content':
              theme === 'fancy' && row.getIsSelected() && i === 0,

            'group-odd:bg-white group-even:bg-gray-50 group-hover:bg-gray-100': theme === 'default',
            'sticky z-[1] shadow-lg': !!cell.column.columnDef.meta.isSticky,
            'left-0 z-[1]':
              cell.column.columnDef.meta.isSticky || cell.column.columnDef.meta.isSticky === 'left',
            'right-0 z-[1]':
              cell.column.columnDef.meta.isSticky ||
              cell.column.columnDef.meta.isSticky === 'right',
          })}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
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
          className={classNames('sticky z-[2] top-0 border-b border-b-gray-300 bg-gray-50', {
            'left-0 z-[3]':
              header.column.columnDef.meta.isSticky ||
              header.column.columnDef.meta.isSticky === 'left',
            'right-0 z-[3]': header.column.columnDef.meta.isSticky === 'right',
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
  );
};

export default TableRow;
