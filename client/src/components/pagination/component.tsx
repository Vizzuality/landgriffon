import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/solid';

import Button from './button';
import { PaginationProps } from './types';

const Table: React.FC<PaginationProps> = ({
  className,
  isLoading = false,
  numItems,
  currentPage,
  totalPages,
  totalItems,
  numNumberButtons = 8,
  onPageClick = () => {
    // noOp
  },
}) => {
  const [pagination, setPagination] = useState({
    numItems: undefined,
    currentPage: undefined,
    totalPages: undefined,
    totalItems: undefined,
  });

  useEffect(() => {
    // Do not update pagination if data is loading.
    if (isLoading) return;
    setPagination({ numItems, currentPage, totalPages, totalItems });
  }, [currentPage, isLoading, numItems, totalItems, totalPages]);

  const calcPagingRange = useCallback(() => {
    // https://codereview.stackexchange.com/a/183472
    const min = 1;
    let length = numNumberButtons;

    if (length > pagination.totalPages) length = pagination.totalPages;

    let start = pagination.currentPage - Math.floor(length / 2);
    start = Math.max(start, min);
    start = Math.min(start, min + pagination.totalPages - length);

    return Array.from({ length: length }, (el, i) => start + i);
  }, [numNumberButtons, pagination]);

  const rangeButtons = calcPagingRange();

  const handleFirstClick = () => {
    onPageClick(1);
  };

  const handlePreviousClick = () => {
    if (pagination.currentPage <= 1) return;
    onPageClick(pagination.currentPage - 1);
  };

  const handleRangeButtonClick = (pageNumber) => {
    onPageClick(pageNumber);
  };

  const handleNextClick = () => {
    if (pagination.currentPage >= pagination.totalPages) return;
    onPageClick(currentPage + 1);
  };

  const handleLastClick = () => {
    onPageClick(pagination.totalPages);
  };

  // We don't have enough values to display the pagination; show nothing.
  if (Object.values(pagination).some((val) => val === undefined)) return null;

  return (
    <div
      className={classNames(
        className,
        'flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center',
      )}
    >
      <div className="text-xs font-bold text-gray-500">
        {numItems} of {totalItems} entries
      </div>

      <div className="flex items-center">
        <Button disabled={pagination.currentPage <= 1} onClick={handleFirstClick}>
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </Button>
        <Button disabled={pagination.currentPage <= 1} onClick={handlePreviousClick}>
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        {rangeButtons.map((buttonNumber) => (
          <Button
            className="select-none"
            key={buttonNumber}
            active={buttonNumber === pagination.currentPage}
            onClick={() => {
              handleRangeButtonClick(buttonNumber);
            }}
          >
            {buttonNumber}
          </Button>
        ))}
        <Button
          disabled={pagination.currentPage >= pagination.totalPages}
          onClick={handleNextClick}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
        <Button
          disabled={pagination.currentPage >= pagination.totalPages}
          onClick={handleLastClick}
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Table;
