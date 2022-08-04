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
    <>
      <tr className={classNames('group', {})} key={row.id} {...props}>
        {row.getVisibleCells().map((cell, i) => (
          <td
            key={cell.id}
            style={{
              width: cell.column.getSize(),
            }}
            className={classNames('h-full border-transparent', {
              'border-l-4': theme === 'default' && i === 0,
              'border-l-green-700': theme === 'default' && row.getIsSelected() && i === 0,
              'bg-white': theme === 'default',

              'group-odd:bg-white group-even:bg-gray-50 group-hover:bg-gray-100':
                theme === 'striped',
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
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
