import { useCallback } from 'react';
import classNames from 'classnames';
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/solid';

import Button from './button';
import { PaginationProps } from './types';

const Pagination: React.FC<PaginationProps> = ({
  className,
  isLoading = false,
  numItems,
  currentPage,
  totalPages,
  totalItems,
  onPageClick,
  showSummary = true,
  numNumberButtons = 8,
}) => {
  const calcPagingRange = useCallback(() => {
    // https://codereview.stackexchange.com/a/183472
    const min = 1;
    let length = numNumberButtons;

    if (length > totalPages) length = totalPages;

    let start = currentPage - Math.floor(length / 2);
    start = Math.max(start, min);
    start = Math.min(start, min + totalPages - length);

    return Array.from({ length: length }, (el, i) => start + i);
  }, [currentPage, numNumberButtons, totalPages]);

  const rangeButtons = calcPagingRange();

  const handleFirstClick = () => {
    onPageClick?.(1);
  };

  const handlePreviousClick = () => {
    if (currentPage <= 1) return;
    onPageClick?.(currentPage - 1);
  };

  const handleRangeButtonClick = (pageNumber) => {
    onPageClick?.(pageNumber);
  };

  const handleNextClick = () => {
    if (currentPage >= totalPages) return;
    onPageClick?.(currentPage + 1);
  };

  const handleLastClick = () => {
    onPageClick?.(totalPages);
  };
  if (isLoading) return null;

  // We don't have enough values to display the pagination; show nothing.
  if ([numItems, currentPage, totalPages, totalItems].some((val) => val === undefined)) return null;

  return (
    <div
      className={classNames(
        className,
        'flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center',
      )}
    >
      {showSummary && (
        <div className="text-xs font-bold text-gray-500">
          {numItems} of {totalItems} entries
        </div>
      )}
      <div className="flex items-center">
        <Button disabled={currentPage <= 1} onClick={handleFirstClick}>
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </Button>
        <Button disabled={currentPage <= 1} onClick={handlePreviousClick}>
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        {rangeButtons.map((buttonNumber) => (
          <Button
            className="select-none"
            key={buttonNumber}
            active={buttonNumber === currentPage}
            onClick={() => {
              handleRangeButtonClick(buttonNumber);
            }}
          >
            {buttonNumber}
          </Button>
        ))}
        <Button disabled={currentPage >= totalPages} onClick={handleNextClick}>
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
        <Button disabled={currentPage >= totalPages} onClick={handleLastClick}>
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
