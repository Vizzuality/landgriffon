import Button from 'components/button';
import Search from 'components/search';
import DownloadMaterialsDataButton from 'containers/admin/download-materials-data-button';
import NoDataUpload from 'containers/admin/no-data-upload';
import NoResults from 'containers/admin/no-results';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import useModal from 'hooks/modals';
import { useSourcingLocationsMaterials } from 'hooks/sourcing-locations';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import { merge } from 'lodash';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import NewTable from 'components/newTable';

import { ExclamationIcon } from '@heroicons/react/solid';
import { useDebounce } from '@react-hook/debounce';

import type { ApiSortingType } from 'components/table';
import type { PaginationState } from '@tanstack/react-table';
import { ColumnType } from 'components/newTable/column';

const AdminDataPage: React.FC = () => {
  const [searchText, setSearchText] = useDebounce('', 250);
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 1,
  });
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
    'page[size]': pagination.pageSize,
    'page[number]': pagination.pageIndex,
  });

  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  /** Processing data for use in the table props */
  const allYears = useMemo(
    () =>
      Array.from(
        new Set(sourcingData.flatMap(({ purchases }) => purchases.map((p) => p.year))),
      ).sort(),
    [sourcingData],
  );

  const { startYear, endYear, yearsInRange, setYearsRange } = useYearsRange({ years: allYears });

  const yearsData = useMemo(() => {
    return {
      columns: allYears.map((year) => ({
        id: year.toString(),
        title: year.toString(),
        type: ColumnType.RawValue,
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
  // const tableProps = useMemo<TableProps>(() => {
  //   return {
  //     isLoading: isFetchingSourcingData,
  //     childComponents: {
  //       cell: {
  //         elementAttributes: () => ({
  //           className: 'p-0',
  //         }),
  //       },
  //     },
  //     rowKeyField: 'id',
  //     columns: [
  //       { key: 'material', title: 'Material', dataType: DataType.String, width: 240 },
  //       { key: 'businessUnit', title: 'Business Unit', dataType: DataType.String },
  //       { key: 't1Supplier', title: 'T1 Supplier', dataType: DataType.String },
  //       { key: 'producer', title: 'Producer', dataType: DataType.String },
  //       { key: 'locationType', title: 'Location Type', dataType: DataType.String },
  //       { key: 'country', title: 'Country', dataType: DataType.String },
  //       ...yearsData.columns.map((column) => ({ ...column, isSortable: false })),
  //     ],
  //     data: merge(sourcingData, yearsData.data),
  //     sortingMode: SortingMode.Api,
  //     defaultSorting: sorting,
  //     onSortingChange: (params: ApiSortingType) => {
  //       setPagination((pag) => ({ ...pag, pageIndex: 1 }));
  //       setSorting(params);
  //     },
  //     // onPageChange: ,
  //     paging: {
  //       enabled: true,
  //       totalItems: sourcingMetadata.totalItems,
  //       pageSize: sourcingMetadata.size,
  //       pageIndex: sourcingMetadata.page,
  //       pagesCount: sourcingMetadata.totalPages,
  //       showSummary: true,
  //     },
  //   } as TableProps;
  // }, [
  //   isFetchingSourcingData,
  //   sorting,
  //   sourcingData,
  //   sourcingMetadata.page,
  //   sourcingMetadata.size,
  //   sourcingMetadata.totalItems,
  //   sourcingMetadata.totalPages,
  //   yearsData.columns,
  //   yearsData.data,
  // ]);

  /** Helpers for use in the JSX */

  const hasData = sourcingData?.length > 0;
  const isFetchingData = isFetchingSourcingData;
  const isSearching = !!searchText;

  const data = useMemo(() => merge(sourcingData, yearsData.data), [sourcingData, yearsData.data]);

  return (
    <AdminLayout currentTab={ADMIN_TABS.DATA} title="Actual data">
      <Head>
        <title>Admin data | Landgriffon</title>
      </Head>
      <div className="flex justify-end gap-3">
        <DownloadMaterialsDataButton
          onDownloading={() => setDataDownloadError(null)}
          onError={setDataDownloadError}
        />
        <Button theme="primary" onClick={openUploadDataSourceModal}>
          Upload data source
        </Button>
      </div>
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
      <NewTable
        data={data}
        columns={[
          {
            id: 'material',
            title: 'Material',
            type: ColumnType.RawValue,
            size: 280,
            align: 'left',
          },
          { id: 'businessUnit', title: 'Business Unit', type: ColumnType.RawValue },
          { id: 't1Supplier', title: 'T1 Supplier', type: ColumnType.RawValue },
          { id: 'producer', title: 'Producer', type: ColumnType.RawValue },
          { id: 'locationType', title: 'Location Type', type: ColumnType.RawValue },
          { id: 'country', title: 'Country', type: ColumnType.RawValue },
          ...(yearsData.columns.map((column) => ({
            id: column.id,
            title: column.title,
            type: ColumnType.RawValue,
            size: 70,
          })) as any),
        ]}
        manualPagination
        state={{
          pagination: {
            pageIndex: sourcingMetadata.page,
            pageSize: sourcingMetadata.size,
          },
        }}
        totalItems={sourcingMetadata.totalItems}
        pageCount={sourcingMetadata.totalPages}
        onPaginationChange={setPagination}
      />
    </AdminLayout>
  );
};

export default AdminDataPage;
