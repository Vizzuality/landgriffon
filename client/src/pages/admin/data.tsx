import { useState, useMemo } from 'react';
import { DataType } from 'ka-table/enums';
import { /*debounce,*/ flatten, merge, uniq } from 'lodash';
// import { ExclamationIcon, FilterIcon } from '@heroicons/react/solid';

import useModal from 'hooks/modals';
import { useSourcingLocationsMaterials } from 'hooks/sourcing-locations';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoData from 'containers/admin/no-data';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import Button from 'components/button';
import Pagination, { PaginationProps } from 'components/pagination';
import Table, { TableProps } from 'containers/table';

const AdminDataPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: sourcingData,
    metadata: sourcingMetadata,
    isFetching: isFetchingSourcingData,
  } = useSourcingLocationsMaterials({
    'page[size]': 10,
    'page[number]': currentPage,
  });

  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  /** Processing data for use in the table props */

  const yearsArray = uniq(
    flatten(sourcingData.map(({ purchases }) => purchases.map(({ year }) => year))).sort(),
  );

  const yearsData = useMemo(
    () => ({
      columns: yearsArray.map((year) => ({
        key: year.toString(),
        title: year.toString(),
        DataType: DataType.Number,
        width: 80,
      })),
      data: sourcingData.map((dataRow) => ({
        ...dataRow,
        ...dataRow.purchases
          .map(({ year, tonnage }) => ({ [year as string]: tonnage }))
          .reduce((a, b) => ({ ...a, ...b })),
      })),
    }),
    [sourcingData, yearsArray],
  );

  /** Table Props */

  const tableProps: TableProps = useMemo(
    () => ({
      rowKeyField: 'id',
      columns: [
        { key: 'materialName', title: 'Material', dataType: DataType.String, width: 240 },
        { key: 'businessUnit', title: 'Business Unit', dataType: DataType.String },
        { key: 't1Supplier', title: 'T1 Supplier', dataType: DataType.String },
        { key: 'producer', title: 'Producer', dataType: DataType.String },
        { key: 'locationType', title: 'Location Type', dataType: DataType.String },
        { key: 'country', title: 'Country', dataType: DataType.String },
        ...yearsData.columns,
      ],
      data: merge(sourcingData, yearsData.data),
    }),
    [sourcingData, yearsData],
  );

  /** Pagination Props */

  const paginationProps: PaginationProps = useMemo(
    () => ({
      numItems: sourcingData.length,
      currentPage: currentPage,
      totalPages: sourcingMetadata.totalPages,
      totalItems: sourcingMetadata.totalItems,
      onPageClick: setCurrentPage,
    }),
    [currentPage, sourcingData, sourcingMetadata],
  );

  /** Search, filtering handling */

  /*
  const handleSearch = debounce(({ target }: { target: HTMLInputElement }): void => {
    console.info('Search: ', target.value);
  }, 200);
  */

  /** Helpers for use in the JSX */

  const hasData = sourcingData?.length > 0;
  const isFetchingData = isFetchingSourcingData;

  return (
    <AdminLayout
      currentTab={ADMIN_TABS.DATA}
      loading={isFetchingSourcingData}
      headerButtons={
        <>
          <Button theme="secondary" onClick={() => console.info('Download: click')}>
            Download
          </Button>
          <Button theme="primary" onClick={openUploadDataSourceModal}>
            Upload data source
          </Button>
        </>
      }
    >
      <UploadDataSourceModal
        open={isUploadDataSourceModalOpen}
        onDismiss={closeUploadDataSourceModal}
      />

      {!hasData && !isFetchingData && <NoData />}

      {hasData && (
        <>
          {/*
          <div className="flex flex-col-reverse items-center justify-between md:flex-row">
            <div className="flex w-full gap-2 md:w-auto">
              <input
                className="w-full text-sm font-medium text-left bg-white border border-gray-300 rounded-md shadow-sm md:w-auto focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700"
                type="search"
                placeholder="Search table"
                defaultValue=""
                onChange={handleSearch}
              />
              <Button theme="secondary" onClick={() => console.info('Filters: click')}>
                <span className="block h-5 truncate">
                  <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
                </span>
                <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-green-700 rounded-full">
                  2
                </span>
              </Button>
            </div>
            <div className="flex items-center text-sm text-yellow-800">
              <ExclamationIcon className="w-5 h-5 mr-3 text-yellow-400" aria-hidden="true" />1 entry
              needs to be updated
            </div>
          </div>
          */}

          <Table {...tableProps} />
          <Pagination className="my-4 ml-4 mr-2" {...paginationProps} />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDataPage;
