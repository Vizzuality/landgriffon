import { SortAscendingIcon, SortDescendingIcon } from '@heroicons/react/solid';

import { SortDirection } from 'ka-table/enums';
import { IHeadCellProps } from 'ka-table/props';
import { isSortingEnabled } from 'ka-table/Utils/SortUtils';

const HeadCellContent: React.FC<IHeadCellProps> = ({ column, sortingMode }: IHeadCellProps) => {
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
