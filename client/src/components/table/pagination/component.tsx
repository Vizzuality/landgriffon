import { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/solid';

import Button from './button';
import { DEFAULT_PAGE_SIZES } from './constants';

import Select from 'components/forms/select';

import type { SelectProps, Option } from 'components/forms/select';
import type { PaginationProps } from './types';

const Pagination: React.FC<PaginationProps> = ({
  className,
  currentPage,
  isLoading = false,
  onPageChange,
  totalPages,
  totalItems,
  availableSizes = DEFAULT_PAGE_SIZES,
  pageSize = DEFAULT_PAGE_SIZES[0],
  onChangePageSize,
}) => {
  const pageSizeOptions = useMemo(
    () => availableSizes.map((size) => ({ label: `${size}`, value: size })),
    [availableSizes],
  );

  const currentPageSize = useMemo(
    () => pageSizeOptions.find(({ value }) => value === pageSize),
    [pageSize, pageSizeOptions],
  );

  const itemsRange = useMemo(
    () => ({
      start: Math.min((currentPage - 1) * pageSize + 1, totalItems),
      end: Math.min(currentPage * pageSize, totalItems),
    }),
    [currentPage, pageSize, totalItems],
  );

  const handleFirstPage = useCallback(() => {
    onPageChange?.(1);
  }, [onPageChange]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage <= 1) return;
    onPageChange?.(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage >= totalPages) return;
    onPageChange?.(currentPage + 1);
  }, [currentPage, onPageChange, totalPages]);

  const handleLastPage = useCallback(() => {
    onPageChange?.(totalPages);
  }, [onPageChange, totalPages]);

  const handlePageSizeChange = useCallback<SelectProps<number>['onChange']>(
    (nextPageSize: Option<number>) => {
      onChangePageSize(nextPageSize?.value);
    },
    [onChangePageSize],
  );

  if (isLoading) return null;

  // We don't have enough values to display the pagination; show nothing.
  if ([currentPage, totalPages, totalItems].some((val) => val === undefined)) return null;

  return (
    <div
      className={classNames(
        className,
        'flex flex-col md:flex-row gap-2 sm:gap-10 items-center justify-start',
      )}
    >
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-500">Rows per page</label>
        <Select<number>
          value={currentPageSize}
          options={pageSizeOptions}
          onChange={handlePageSizeChange}
        />
      </div>
      <div className="text-sm text-center text-gray-500">
        {itemsRange.start}-{itemsRange.end} of {totalItems}
      </div>
      <div className="flex items-center">
        <Button disabled={currentPage <= 1} onClick={handleFirstPage}>
          <ChevronDoubleLeftIcon className="w-4 h-4" />
        </Button>
        <Button disabled={currentPage <= 1} onClick={handlePreviousPage}>
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <Button disabled={currentPage >= totalPages} onClick={handleNextPage}>
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
        <Button disabled={currentPage >= totalPages} onClick={handleLastPage}>
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
