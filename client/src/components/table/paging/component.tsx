import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import ChevronLast from 'components/icons/chevronLast';
import Pagination from 'components/pagination';
import Select from 'components/select';
import { updatePageIndex, updatePageSize } from 'ka-table/actionCreators';
import { IPagingProps } from 'ka-table/props';
import { useCallback } from 'react';

interface PagingProps extends IPagingProps {
  totalRows: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const Paging: React.FC<PagingProps> = ({
  dispatch,
  pageIndex,
  pageSize,
  pageSizes,
  pagesCount,
  totalRows,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 0 || page > pagesCount) return;
      onPageChange?.(page);
      dispatch(updatePageIndex(page));
    },
    [dispatch, onPageChange, pagesCount],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      if (size <= 0) return;
      onPageSizeChange?.(size);
      dispatch(updatePageSize(size));
    },
    [dispatch, onPageSizeChange],
  );

  const rowStartRange = pageIndex * pageSize + 1;
  const rowEndRange = rowStartRange + pageSize - 1;

  return (
    <>
      <div className="flex flex-row gap-2">
        <div className="my-auto text-gray-700">Rows per page</div>
        <div>
          <Select
            onChange={({ value }) => handlePageSizeChange(value as number)}
            current={{ label: `${pageSize}`, value: pageSize }}
            options={pageSizes.map((size) => ({ label: `${size}`, value: size }))}
          />
        </div>
      </div>
      <div className="my-auto">
        {rowStartRange}-{Math.min(totalRows, rowEndRange)} of {totalRows}
      </div>
      <div>
        <Pagination
          isLoading={isLoading}
          totalPages={pagesCount}
          // TODO: assumming pages starts at 0, check how the API handles it
          onPageClick={(page) => handlePageChange(page - 1)}
          currentPage={pageIndex + 1}
          numItems={pageSize}
          totalItems={totalRows}
        />
      </div>
    </>
  );
};

export default Paging;
