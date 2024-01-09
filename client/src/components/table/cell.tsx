import {
  ChevronRightIcon,
  SelectorIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from '@heroicons/react/solid';
import classNames from 'classnames';

import type { CellContext, HeaderContext } from '@tanstack/react-table';

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

  const { align } = context.column.columnDef?.meta || {};
  const { depth } = context.row;

  const isExpandible = isFirstColumn && context.row.getCanExpand();
  const isExpanded = isExpandible && context.row.getIsExpanded();
  const toggleExpand = context.row.getToggleExpandedHandler();
  const canExpand = context.table.getCanSomeRowsExpand();

  return (
    <div
      onClick={isExpandible ? toggleExpand : undefined}
      className={classNames(
        getAlignmentClasses(align),
        'min-h-20 relative flex w-full items-center justify-start',
        {
          'cursor-pointer': isExpandible,
          'ml-7 pr-7': canExpand && !isExpandible && isFirstColumn,
          'pl-3 text-sm font-normal': isFirstColumn && depth === 0,
          'pl-10 text-2xs font-semibold uppercase': isFirstColumn && depth === 1,
          'pl-[72px] text-xs font-normal': isFirstColumn && depth >= 2,
          'text-sm': !isFirstColumn,
        },
      )}
    >
      <div className="mx-auto my-auto w-full">
        {isExpandible ? (
          <div className="flex items-center gap-3">
            <div className="h-4 w-4">
              <ChevronRightIcon
                className={classNames(' text-gray-900', {
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

  const { align } = context.column.columnDef?.meta || {};

  return (
    <div
      className={classNames('my-auto py-2 text-left text-xs font-normal uppercase text-gray-400', {
        'pl-[25px]': isFirstColumn,
      })}
    >
      <div
        className={classNames('flex flex-row items-center gap-2', getAlignmentClasses(align), {
          'justify-center': align === 'center',
        })}
      >
        <div>{children}</div>
        {context.column.getCanSort() && (
          <div
            className={classNames('h-5 w-5 cursor-pointer ', {
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
