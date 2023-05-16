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
  firstProjectedYear?: number;
}

const TableRow = <T,>({ row, theme, isLast, firstProjectedYear, ...props }: TableRowProps<T>) => {
  const cells = useMemo(() => row.getVisibleCells(), [row]);
  return (
    <>
      <tr className="group" key={row.id} {...props}>
        {cells.map((cell, i) => {
          const isProjectedFirstYear =
            firstProjectedYear && cell.id.includes((firstProjectedYear - 1)?.toString());
          return (
            <td
              key={cell.id}
              style={{
                width: cell.column.getSize(),
                borderRightStyle: isProjectedFirstYear ? 'dashed' : 'none',
              }}
              className={classNames('h-full border-transparent group-hover:bg-gray-100', {
                'border-l-4': theme === 'default' && i === 0,
                'border-l-navy-400 group-hover:border-l-navy-400':
                  theme === 'default' && row.getIsSelected() && i === 0,
                'border-l-white -ml-1': theme === 'default' && !row.getIsSelected() && i === 0,
                'bg-white group-hover:border-l-gray-100': theme === 'default',
                'group-odd:bg-white group-even:bg-gray-50': theme === 'striped',
                'sticky z-[1]': !!cell.column.columnDef.meta?.isSticky,
                'shadow-[4px_1px_10px_-2px] shadow-gray-100':
                  !!cell.column.columnDef.meta?.isSticky,
                'left-0': cell.column.columnDef.meta?.isSticky === 'left',
                'right-0': cell.column.columnDef.meta?.isSticky === 'right',
                'border-r-2 border-r-gray-200': isProjectedFirstYear,
                'border-t-2 border-t-gray-200': row.index === 0 && row.depth === 0,
              })}
            >
              <CellWrapper context={cell.getContext()}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </CellWrapper>
            </td>
          );
        })}
      </tr>
      {isLast && theme !== 'striped' && (
        <tr aria-hidden className="h-0.5 bg-gray-100 last:hidden"></tr>
      )}
    </>
  );
};

interface TableHeaderRowProps<T> {
  headerGroup: HeaderGroup<T>;
  firstProjectedYear?: number;
  className?: string;
  headerTheme?: 'clean' | 'default';
}

export const TableHeaderRow = <T,>({
  headerGroup,
  firstProjectedYear,
  headerTheme = 'default',
}: TableHeaderRowProps<T>) => {
  return (
    <tr key={headerGroup.id} className="border-b-2 border-b-gray-200">
      {headerGroup.headers.map((header) => {
        const isProjectedFirstYear =
          !!firstProjectedYear && (firstProjectedYear - 1)?.toString() === header.id;
        const isFirstColumn = header.index === 0;
        const isLastColumn = header.index === headerGroup.headers.length - 1;
        const sticky = header.column.columnDef.meta?.isSticky;
        return (
          <th
            className={classNames('sticky z-[2] top-0 bg-gray-50', {
              'left-0 z-[3] shadow-[4px_1px_10px_-2px_rgba(21,24,31,0.08)]': sticky === 'left',
              'right-0 z-[3]': sticky === 'right',
              'rounded-tr-lg': isLastColumn,
              'rounded-tl-lg': isFirstColumn,
              'border-r border-r-gray-200':
                !sticky && headerTheme === 'default' && !isLastColumn && !isProjectedFirstYear,
              'border-r-2 border-dashed': isProjectedFirstYear,
            })}
            key={header.id}
            style={{ width: header.column.getSize() }}
          >
            {header.isPlaceholder ? null : (
              <HeaderCell context={header.getContext()}>
                {firstProjectedYear?.toString() === header.id && (
                  <div className="font-medium absolute leading-4 top-0 h-[24px] -translate-y-[24px] -translate-x-[58px] bg-gray-200 text-2xs py-1 px-4 rounded-t-lg text-gray-600 normal-case">
                    Projected years
                  </div>
                )}
                {flexRender(header.column.columnDef.header, header.getContext())}
              </HeaderCell>
            )}
          </th>
        );
      })}
    </tr>
  );
};

export default TableRow;
