import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import Select from 'components/select';
import { updatePageIndex, updatePageSize } from 'ka-table/actionCreators';
import { IPagingProps } from 'ka-table/props';
import { useCallback } from 'react';

interface PagingProps extends IPagingProps {
  totalRows: number;
}

const Paging: React.FC<PagingProps> = ({
  dispatch,
  pageIndex,
  pageSize,
  pageSizes,
  pagesCount,
  totalRows,
}) => {
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 0 || page > pagesCount) return;
      dispatch(updatePageIndex(page));
    },
    [dispatch, pagesCount],
  );
  const rowStartRange = pageIndex * pageSize + 1;
  const rowEndRange = rowStartRange + pageSize - 1;

  return (
    <>
      <div className="flex flex-row gap-2">
        <div className="my-auto text-gray-700">Rows per page</div>
        <div>
          <Select
            onChange={({ value }) => dispatch(updatePageSize(value as number))}
            current={{ label: `${pageSize}`, value: pageSize }}
            options={pageSizes.map((size) => ({ label: `${size}`, value: size }))}
          />
        </div>
      </div>
      <div className="my-auto">
        {rowStartRange}-{Math.min(totalRows, rowEndRange)} of {totalRows}
      </div>
      <div className="flex flex-row my-auto">
        <ChevronLeftIcon
          className="w-5 h-5"
          onClick={() => {
            handlePageChange(pageIndex - 1);
          }}
        />
        <ChevronRightIcon
          className="w-5 h-5"
          onClick={() => {
            handlePageChange(pageIndex + 1);
          }}
        />
      </div>
    </>
  );
};

export default Paging;
