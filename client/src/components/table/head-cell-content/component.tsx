import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid';

import { SortDirection } from 'ka-table/enums';
import { IHeadCellProps } from 'ka-table/props';
import { isSortingEnabled } from 'ka-table/Utils/SortUtils';

import type { Column } from 'ka-table/models';

interface CustomColumn extends Column {
  isFirstYearProjected?: boolean;
}

interface CustomIHeadCellProps extends IHeadCellProps {
  column: CustomColumn;
}

const HeadCellContent: React.FC<CustomIHeadCellProps> = ({
  column,
  sortingMode,
}: CustomIHeadCellProps) => {
  const sortingEnabled = isSortingEnabled(sortingMode);

  return (
    <>
      {column.title}
      {column.sortDirection &&
        sortingEnabled &&
        (column.sortDirection === SortDirection.Ascend ? (
          <SortAscendingIcon className="inline w-4 h-4 ml-2" />
        ) : (
          <SortDescendingIcon className="inline w-4 h-4 ml-2" />
        ))}
    </>
  );
};

export default HeadCellContent;
