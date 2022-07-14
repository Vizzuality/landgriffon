import { useState, useMemo } from 'react';
import Head from 'next/head';
import { flatten, merge, uniq } from 'lodash';
import { useDebounce } from '@react-hook/debounce';
import { ExclamationIcon /*, FilterIcon*/ } from '@heroicons/react/solid';

import useModal from 'hooks/modals';
import { useSourcingLocationsMaterials } from 'hooks/sourcing-locations';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoDataUpload from 'containers/admin/no-data-upload';
import NoResults from 'containers/admin/no-results';
import DownloadMaterialsDataButton from 'containers/admin/download-materials-data-button';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import Button from 'components/button';
import Pagination, { PaginationProps } from 'components/pagination';
import Search from 'components/search';
import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import {
  TableNoSSR as Table,
  TableProps,
  DataType,
  SortingMode,
  ApiSortingType,
} from 'components/table';

const AdminDataPage: React.FC = () => {
  const [searchText, setSearchText] = useDebounce('', 250);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sorting, setSorting] = useState<ApiSortingType>();
  const [dataDownloadError, setDataDownloadError] = useState<string>();

  const {
    data: sourcingData,
    meta: sourcingMetadata,
    isFetching: isFetchingSourcingData,
  } = useSourcingLocationsMaterials({
    ...(sorting && {
      // Even though in the data the key is `materialName`, the endpoint
      // expects it to be `material` when using filters.
      orderBy: sorting.orderBy === 'materialName' ? 'material' : sorting.orderBy,
      order: sorting.order,
    }),
    search: searchText,
    'page[size]': 10,
    'page[number]': currentPage,
  });

  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  /** Processing data for use in the table props */

  const allYears = uniq(
    flatten(sourcingData.map(({ purchases }) => purchases.map(({ year }) => year))).sort(),
  );

  const { startYear, endYear, yearsInRange, setYearsRange } = useYearsRange({ years: allYears });

  const yearsData = useMemo(() => {
    return {
      columns: allYears.map((year) => ({
        key: year.toString(),
        title: year.toString(),
        DataType: DataType.Number,
        width: 80,
        visible: yearsInRange.includes(year),
      })),
      data: sourcingData.map((dataRow) => ({
        ...dataRow,
        ...dataRow.purchases
          .map(({ year, tonnage }) => ({ [year as string]: tonnage }))
          .reduce((a, b) => ({ ...a, ...b })),
      })),
    };
  }, [allYears, sourcingData, yearsInRange]);

  /** Table Props */

  const tableProps: TableProps = useMemo(() => {
    return {
      isLoading: isFetchingSourcingData,
      rowKeyField: 'id',
      columns: [
        { key: 'material', title: 'Material', dataType: DataType.String, width: 240 },
        { key: 'businessUnit', title: 'Business Unit', dataType: DataType.String },
        { key: 't1Supplier', title: 'T1 Supplier', dataType: DataType.String },
        { key: 'producer', title: 'Producer', dataType: DataType.String },
        { key: 'locationType', title: 'Location Type', dataType: DataType.String },
        { key: 'country', title: 'Country', dataType: DataType.String },
        ...yearsData.columns.map((column) => ({ ...column, isSortable: false })),
      ],
      data: merge(sourcingData, yearsData.data),
      sortingMode: SortingMode.Api,
      defaultSorting: sorting,
      onSortingChange: (params: ApiSortingType) => {
        setCurrentPage(1);
        setSorting(params);
      },
    };
  }, [isFetchingSourcingData, sorting, sourcingData, yearsData.columns, yearsData.data]);

  /** Pagination Props */

  const paginationProps: PaginationProps = useMemo(
    () => ({
      isLoading: isFetchingSourcingData,
      numItems: sourcingData.length,
      currentPage: currentPage,
      totalPages: sourcingMetadata.totalPages,
      totalItems: sourcingMetadata.totalItems,
      onPageClick: setCurrentPage,
    }),
    [currentPage, isFetchingSourcingData, sourcingData, sourcingMetadata],
  );

  /** Helpers for use in the JSX */

  const hasData = sourcingData?.length > 0;
  const isFetchingData = isFetchingSourcingData;
  const isSearching = !!searchText;

  return (
    <AdminLayout
      currentTab={ADMIN_TABS.DATA}
      headerButtons={
        <>
          <DownloadMaterialsDataButton
            onDownloading={() => setDataDownloadError(null)}
            onError={setDataDownloadError}
          />
          <Button theme="primary" onClick={openUploadDataSourceModal}>
            Upload data source
          </Button>
        </>
      }
    >
      <Head>
        <title>Admin data | Landgriffon</title>
      </Head>

      <UploadDataSourceModal
        open={isUploadDataSourceModalOpen}
        onDismiss={closeUploadDataSourceModal}
      />

      {!hasData && !isFetchingData && !isSearching && <NoDataUpload />}

      {!(!hasData && !isFetchingData && !isSearching) && (
        <div className="flex flex-col-reverse items-center justify-between md:flex-row">
          <div className="flex w-full gap-2 md:w-auto">
            <Search placeholder="Search table" onChange={setSearchText} />
            <YearsRangeFilter
              startYear={startYear}
              endYear={endYear}
              years={allYears}
              onChange={setYearsRange}
            />
            {/*
            <Button theme="secondary" onClick={() => console.info('Filters: click')}>
              <span className="block h-5 truncate">
                <FilterIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
              </span>
              <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-green-700 rounded-full">
                2
              </span>
            </Button>
            */}
          </div>
          {dataDownloadError && (
            <div className="flex items-center text-sm text-yellow-800">
              <ExclamationIcon className="w-5 h-5 mr-3 text-yellow-400" aria-hidden="true" />
              {dataDownloadError}
            </div>
          )}
        </div>
      )}

      {!hasData && isSearching && <NoResults />}

      {(hasData || isFetchingData) && (
        <>
          {/* <Table {...tableProps} /> */}
          <Pagination className="my-4 ml-4 mr-2" {...paginationProps} />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDataPage;
