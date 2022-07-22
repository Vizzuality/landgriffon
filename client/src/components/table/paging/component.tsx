import Pagination from 'components/pagination';
import Select from 'components/select';
import { updatePageIndex, updatePageSize } from 'ka-table/actionCreators';
import type { IPagingProps } from 'ka-table/props';
import { useCallback } from 'react';

interface PagingProps extends IPagingProps {
  totalRows: number;
  isLoading?: boolean;
}

const Paging: React.FC<PagingProps> = ({
  dispatch,
  pageIndex,
  pageSize,
  pageSizes,
  pagesCount,
  totalRows,
  isLoading = false,
}) => {
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 0 || page > pagesCount) return;
      dispatch(updatePageIndex(page));
    },
    [dispatch, pagesCount],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      if (size <= 0) return;
      dispatch(updatePageSize(size));
    },
    [dispatch],
  );

  const itemsInThisPage = pageIndex + 1 === pagesCount ? totalRows % pageSize : pageSize;

  return (
    <>
      <div className="flex flex-row gap-2">
        <div className="my-auto text-sm text-gray-500">Rows per page</div>
        <div>
          <Select
            onChange={({ value }) => handlePageSizeChange(value as number)}
            current={{ label: `${pageSize}`, value: pageSize }}
            options={pageSizes.map((size) => ({ label: `${size}`, value: size }))}
          />
        </div>
      </div>
      <div>
        <Pagination
          isLoading={isLoading}
          totalPages={pagesCount}
          onPageClick={(page) => handlePageChange(page)}
          currentPage={pageIndex + 1}
          numItems={itemsInThisPage}
          totalItems={totalRows}
          showSummary={false}
        />
      </div>
    </>
  );
};

export default Paging;
