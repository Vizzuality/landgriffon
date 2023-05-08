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
        'relative flex items-center justify-start w-full min-h-20',
        {
          'cursor-pointer': isExpandible,
          'pl-2.5 font-bold text-sm': !canExpand && isFirstColumn && depth === 0,
          'pl-4 font-normal text-sm': canExpand && isFirstColumn && depth === 0,
          'pl-10 uppercase text-2xs font-semibold': isFirstColumn && depth === 1,
          'pl-[72px] text-xs font-normal': isFirstColumn && depth === 2,
          'text-sm': !isFirstColumn,
        },
      )}
    >
      <div className="w-full mx-auto my-auto">
        {canExpand ? (
          <div className="flex items-center gap-4">
            <div className="w-4 h-4">
              <ChevronRightIcon
                className={classNames(' text-gray-900', {
                  'rotate-90': isExpanded,
                  hidden: !isExpandible,
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
      className={classNames('py-2 my-auto text-xs text-left text-gray-400 uppercase font-normal', {
        'pl-[25px]': isFirstColumn,
      })}
    >
      <div
        className={classNames('flex flex-row gap-2 items-center', getAlignmentClasses(align), {
          'justify-center': align === 'center',
        })}
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
