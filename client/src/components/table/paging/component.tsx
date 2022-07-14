import Pagination from 'components/pagination';
import Select from 'components/select';
import { updatePageIndex, updatePageSize } from 'ka-table/actionCreators';
import { IPagingProps } from 'ka-table/props';
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
          // numNumberButtons={0}
          isLoading={isLoading}
          totalPages={pagesCount}
          onPageClick={(page) => handlePageChange(page)}
          currentPage={pageIndex + 1}
          numItems={totalRows % pageSize}
          totalItems={totalRows}
          showSummary={false}
        />
      </div>
    </>
  );
};

export default Paging;
