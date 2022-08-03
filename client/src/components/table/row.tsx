import type { HeaderGroup, Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import classNames from 'classnames';

interface TableRowProps<T> {
  row: Row<T>;
}

const TableRow = <T,>({ row }: TableRowProps<T>) => {
  return (
    <tr className="group" key={row.id}>
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          style={{
            width: cell.column.getSize(),
          }}
          className={classNames(
            'group-odd:bg-white group-even:bg-gray-50 group-hover:bg-gray-100 h-full',
            {
              'sticky left-0 z-[1] shadow-lg': cell.column.columnDef.meta.isSticky,
            },
          )}
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
            'left-0 z-[3]': header.column.columnDef.meta.isSticky,
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
