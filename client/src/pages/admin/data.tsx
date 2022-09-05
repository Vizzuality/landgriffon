import { useMemo, useState } from 'react';
import { merge } from 'lodash';
import Head from 'next/head';
import { ExclamationIcon, PlusIcon } from '@heroicons/react/solid';
import { useDebounce } from '@react-hook/debounce';
import { format } from 'date-fns';

import useModal from 'hooks/modals';
import { useSourcingLocations, useSourcingLocationsMaterials } from 'hooks/sourcing-locations';

import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import DownloadMaterialsDataButton from 'containers/admin/download-materials-data-button';
import NoDataUpload from 'containers/admin/no-data-upload';
import NoResults from 'containers/admin/no-results';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import Button from 'components/button';
import Search from 'components/search';

import Table from 'components/table';

import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { ColumnDefinition } from 'components/table/column';
import type { SourcingLocation } from 'types';

const AdminDataPage: React.FC = () => {
  const [searchText, setSearchText] = useDebounce('', 250);
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 1,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dataDownloadError, setDataDownloadError] = useState<string>();

  // Getting sourcing locations to extract the update date
  const { data: sourcingLocations, isLoading: isSourcingLocationsLoading } = useSourcingLocations({
    fields: 'updatedAt',
    'page[number]': 1,
    'page[size]': 1,
  });

  const {
    data: sourcingData,
    meta: sourcingMetadata,
    isFetching: isFetchingSourcingData,
  } = useSourcingLocationsMaterials(
    {
      ...(sorting[0] && {
        // Even though in the data the key is `materialName`, the endpoint
        // expects it to be `material` when using filters.
        orderBy: sorting[0].id === 'materialName' ? 'material' : sorting[0].id,
        order: sorting[0].desc ? 'desc' : 'asc',
      }),
      search: searchText,
      'page[size]': pagination.pageSize,
      'page[number]': pagination.pageIndex,
    },
    {
      keepPreviousData: true,
    },
  );

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
        id: `${year}`,
        title: `${year}`,
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

  /** Helpers for use in the JSX */

  const hasData = sourcingData?.length > 0;
  const isFetchingData = isFetchingSourcingData;
  const isSearching = !!searchText;

  const data = useMemo(() => merge(sourcingData, yearsData.data), [sourcingData, yearsData.data]);

  const yearsColumns = useMemo<ColumnDefinition<SourcingLocation[]>[]>(
    () =>
      yearsData.columns.map((column) => ({
        id: column.id,
        title: column.title,
        enableHiding: !column.visible,
      })),
    [yearsData.columns],
  );

  return (
    <AdminLayout currentTab={ADMIN_TABS.DATA} title="Manage data">
      <Head>
        <title>Manage data | Landgriffon</title>
      </Head>

      {/* Toolbar */}
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          {!(!hasData && !isFetchingData && !isSearching) && (
            <Search placeholder="Search table" onChange={setSearchText} />
          )}
        </div>
        {!(!hasData && !isFetchingData && !isSearching) && (
          <YearsRangeFilter
            startYear={startYear}
            endYear={endYear}
            years={allYears}
            onChange={setYearsRange}
          />
        )}
        <DownloadMaterialsDataButton
          onDownloading={() => setDataDownloadError(null)}
          onError={setDataDownloadError}
        />
        <Button
          theme="primary"
          onClick={openUploadDataSourceModal}
          icon={<PlusIcon className="w-4 h-4 text-primary" />}
        >
          Upload data source
        </Button>
      </div>

      {/* Content when empty */}
      {!hasData && !isFetchingData && !isSearching && <NoDataUpload />}
      {!(!hasData && !isFetchingData && !isSearching) && (
        <div className="flex flex-col-reverse items-center justify-between md:flex-row">
          {dataDownloadError && (
            <div className="flex items-center text-sm text-yellow-800">
              <ExclamationIcon className="w-5 h-5 mr-3 text-yellow-400" aria-hidden="true" />
              {dataDownloadError}
            </div>
          )}
        </div>
      )}

      {/* Content when data */}
      {!hasData && isSearching && <NoResults />}
      <div className="mt-5">
        {sourcingLocations && !isSourcingLocationsLoading && sourcingLocations.data.length && (
          <div className="flex w-full justify-end mb-4">
            <span className="text-gray-400 text-sm">
              Last update: {format(new Date(sourcingLocations.data[0].updatedAt), 'd MMM yyyy')}
            </span>
          </div>
        )}
        <Table
          theme="striped"
          getSubRows={(row) => row.children}
          isLoading={isFetchingData}
          data={data}
          onSortingChange={setSorting}
          columns={[
            {
              id: 'material',
              header: 'Material',
              size: 280,
              align: 'left',
              isSticky: true,
              enableSorting: true,
            },
            { id: 'businessUnit', header: 'Business Unit' },
            { id: 't1Supplier', header: 'T1 Supplier' },
            { id: 'producer', header: 'Producer' },
            { id: 'locationType', header: 'Location Type' },
            { id: 'country', header: 'Country' },
            ...yearsColumns,
          ]}
          state={{
            pagination: {
              pageIndex: sourcingMetadata.page,
              pageSize: sourcingMetadata.size,
            },
            sorting,
          }}
          paginationProps={{
            itemNumber: data.length,
            totalItems: sourcingMetadata.totalItems,
            pageCount: sourcingMetadata.totalPages,
          }}
          onPaginationChange={setPagination}
        />
      </div>

      <UploadDataSourceModal
        open={isUploadDataSourceModalOpen}
        onDismiss={closeUploadDataSourceModal}
      />
    </AdminLayout>
  );
};

export default AdminDataPage;
