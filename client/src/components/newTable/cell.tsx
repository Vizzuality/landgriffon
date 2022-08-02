import {
  ChevronRightIcon,
  SelectorIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from '@heroicons/react/solid';
import type { CellContext, ColumnMeta, HeaderContext } from '@tanstack/react-table';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';

interface CellProps<T, C> {
  context: CellContext<T, C>;
  className?: string;
  style?: CSSProperties;
}

const renderChildren = <T, C>(format: ColumnMeta<T, C>['format'], children: C) => {
  if (!children) return '-';

  return format ? format(children) : children;
};

const Cell = <T, C>({ children, className, context }: React.PropsWithChildren<CellProps<T, C>>) => {
  const isFirstColumn = context.table.getAllColumns()[0].id === context.column.id;

  const renderedChildren = useMemo(
    () => renderChildren(context.column.columnDef.meta.format, children),
    [context.column.columnDef.meta.format, children],
  );

  return (
    <div
      style={{
        paddingLeft: isFirstColumn && `${context.row.depth * 20 + 25}px`,
      }}
      className={classNames(
        'relative flex items-center justify-start w-full h-20 truncate',
        className,
      )}
    >
      <div className="w-full mx-auto truncate">
        {isFirstColumn && context.row.getCanExpand() && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-[15px] cursor-pointer"
            onClick={context.row.getToggleExpandedHandler()}
          >
            <ChevronRightIcon
              className={classNames('w-4 h-4 text-gray-900', {
                'rotate-90': context.row.getIsExpanded(),
              })}
            />
          </div>
        )}
        {renderedChildren}
      </div>
    </div>
  );
};

interface HeaderCellProps<T, C> {
  className?: string;
  context: HeaderContext<T, C>;
}

export const HeaderCell = <T, C>({
  children,
  className,
  context: { column, table },
}: React.PropsWithChildren<HeaderCellProps<T, C>>) => {
  const isFirstColumn = table.getAllColumns()[0].id === column.id;
  const isSorted = column.getIsSorted();
  return (
    <div
      className={classNames(
        'py-1 my-auto text-xs text-left text-gray-500 uppercase',
        {
          'pl-[25px]': isFirstColumn,
        },
        className,
      )}
    >
      <div className="flex flex-row justify-start gap-2">
        {children}
        {column.getCanSort() && (
          <div className="w-5 h-5 cursor-pointer" onClick={column.getToggleSortingHandler()}>
            {isSorted === 'asc' && <SortAscendingIcon />}
            {isSorted === 'desc' && <SortDescendingIcon />}
            {!isSorted && <SelectorIcon />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cell;
