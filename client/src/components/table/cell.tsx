import {
  ChevronRightIcon,
  SelectorIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from '@heroicons/react/solid';
import type { CellContext, ColumnMeta, HeaderContext } from '@tanstack/react-table';
import classNames from 'classnames';
import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';

type CellProps<T, C> = {
  context: CellContext<T, C>;
  align?: 'left' | 'center' | 'right';
} & Partial<HTMLAttributes<HTMLDivElement>>;

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

const renderChildren = <T, C>(format: ColumnMeta<T, C>['format'], children: C) => {
  if (!children) return '-';

  return format ? format(children) : children;
};

const Cell = <T, C>({
  style: styleProp,
  children,
  className,
  context,
  align = 'center',
  ...props
}: React.PropsWithChildren<CellProps<T, C>>) => {
  const isFirstColumn = context.table.getAllColumns()[0].id === context.column.id;

  const renderedChildren = useMemo(
    // @ts-expect-error I have to fix this types later
    () => renderChildren(context.column.columnDef.meta.format, children),
    [context.column.columnDef.meta.format, children],
  );

  const style = useMemo(
    () => ({
      paddingLeft: isFirstColumn ? `${context.row.depth * 20 + 25}px` : '25px',
      ...styleProp,
    }),
    [context.row.depth, isFirstColumn, styleProp],
  );

  return (
    <div
      style={style}
      className={classNames(getAlignmentClasses(align), {
        'pr-5 relative flex items-center justify-start w-full h-20 truncate': !className,
        [className]: !!className,
      })}
      {...props}
    >
      <div className="w-full mx-auto my-auto truncate">
        <>
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
        </>
      </div>
    </div>
  );
};

interface HeaderCellProps<T, C> {
  className?: string;
  align?: 'left' | 'center' | 'right';
  context: HeaderContext<T, C>;
}

export const HeaderCell = <T, C>({
  children,
  className,
  align = 'center',
  context: { column, table },
}: React.PropsWithChildren<HeaderCellProps<T, C>>) => {
  const isFirstColumn = table.getAllColumns()[0].id === column.id;
  const isSorted = column.getIsSorted();
  return (
    <div
      className={classNames(className, 'py-1 my-auto text-xs text-left text-gray-500 uppercase', {
        'pl-[25px]': isFirstColumn,
      })}
    >
      <div className={classNames('flex flex-row justify-start gap-2', getAlignmentClasses(align))}>
        <div className="w-full">{children}</div>
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
