import {
  ChevronRightIcon,
  SelectorIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from '@heroicons/react/solid';
import type { CellContext, HeaderContext } from '@tanstack/react-table';
import classNames from 'classnames';
import { useMemo } from 'react';

interface CellProps<T, C> {
  context: CellContext<T, C>;
}

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

const CellWrapper = <T, C>({ children, context }: React.PropsWithChildren<CellProps<T, C>>) => {
  const isFirstColumn = context.table.getAllColumns()[0].id === context.column.id;
  const { align } = context.column.columnDef.meta;
  const style = useMemo(
    () => ({
      paddingLeft: isFirstColumn ? `${context.row.depth * 20 + 25}px` : '25px',
    }),
    [context.row.depth, isFirstColumn],
  );

  const isExpandible = isFirstColumn && context.row.getCanExpand();
  const isExpanded = isExpandible && context.row.getIsExpanded();
  const toggleExpand = context.row.getToggleExpandedHandler();

  return (
    <div
      onClick={isExpandible ? toggleExpand : undefined}
      style={style}
      className={classNames(
        getAlignmentClasses(align),
        'pr-5 relative flex items-center justify-start w-full h-20',
        { 'cursor-pointer': isExpandible },
      )}
    >
      <div className="w-full mx-auto my-auto space-x-2">
        {isExpandible ? (
          <div>
            <div className="absolute -translate-x-5 -translate-y-1/2 top-1/2">
              <ChevronRightIcon
                className={classNames('w-4 h-4 text-gray-900', {
                  'rotate-90': isExpanded,
                })}
              />
            </div>
            {children || '-'}
          </div>
        ) : (
          <>{children || '-'}</>
        )}
      </div>
    </div>
  );
};

interface HeaderCellProps<T, C> {
  context: HeaderContext<T, C>;
}

export const HeaderCell = <T, C>({
  children,
  context,
}: React.PropsWithChildren<HeaderCellProps<T, C>>) => {
  const isFirstColumn = context.table.getAllColumns()[0].id === context.column.id;
  const isSorted = context.column.getIsSorted();

  const { align } = context.column.columnDef.meta;

  return (
    <div
      className={classNames('py-2 my-auto text-sm text-left text-gray-500 uppercase', {
        'pl-[25px]': isFirstColumn,
      })}
    >
      <div
        className={classNames(
          'flex flex-row justify-center items-center gap-2',
          getAlignmentClasses(align),
        )}
      >
        <div>{children}</div>
        {context.column.getCanSort() && (
          <div
            className={classNames('w-5 h-5 cursor-pointer ', {
              'text-gray-400 hover:text-gray-500': !isSorted,
              'text-gray-500': isSorted,
            })}
            onClick={context.column.getToggleSortingHandler()}
          >
            {isSorted === 'asc' && <SortAscendingIcon />}
            {isSorted === 'desc' && <SortDescendingIcon />}
            {!isSorted && <SelectorIcon />}
          </div>
        )}
      </div>
    </div>
  );
};

export default CellWrapper;
