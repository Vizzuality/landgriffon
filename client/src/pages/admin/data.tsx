import { useMemo, useState } from 'react';
import { merge } from 'lodash';
import Head from 'next/head';
import { ExclamationIcon, PlusIcon, DownloadIcon } from '@heroicons/react/solid';
import { useDebounce } from '@react-hook/debounce';
import { format } from 'date-fns';

import useModal from 'hooks/modals';
import { useSourcingLocations, useSourcingLocationsMaterials } from 'hooks/sourcing-locations';
import { useTasks } from 'hooks/tasks';

import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import DownloadMaterialsDataButton from 'containers/admin/download-materials-data-button';
import NoResults from 'containers/admin/no-results';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import DataUploader from 'containers/data-uploader';
import Button, { Anchor } from 'components/button';
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

  // Getting last task available
  const { data: tasks } = useTasks({ 'page[size]': 1, sort: '-createdAt' });
  const lastTask = tasks?.[0];
  console.log(lastTask);

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

      {/* Content when empty */}
      {sourcingLocations.data.length === 0 && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="space-y-10">
            <div className="space-y-4 text-lg text-center">
              <p className="font-semibold">
                1. Download the Excel template and fill it with your data.
              </p>
              <Anchor
                href="/files/data-template.xlsx"
                download
                target="_blank"
                rel="noopener noreferrer"
                icon={<DownloadIcon className="w-5 h-5 text-white" aria-hidden="true" />}
              >
                Download template
              </Anchor>
            </div>
            <div className="space-y-4 text-lg text-center">
              <p className="font-semibold">2. Upload the filled Excel file.</p>
              <DataUploader />
            </div>
          </div>
        </div>
      )}

      {/* {!hasData && !isFetchingData && !isSearching && <NoDataUpload />}
      {!(!hasData && !isFetchingData && !isSearching) && (
        <div className="flex flex-col-reverse items-center justify-between md:flex-row">
          {dataDownloadError && (
            <div className="flex items-center text-sm text-yellow-800">
              <ExclamationIcon className="w-5 h-5 mr-3 text-yellow-400" aria-hidden="true" />
              {dataDownloadError}
            </div>
          )}
        </div>
      )} */}

      {/* Content when data */}
      {sourcingLocations.data?.length > 0 && (
        <>
          <div className="flex w-full gap-2">
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
              icon={
                <span className="inline-flex items-center justify-center w-5 h-5 mr-4 bg-white rounded-full">
                  <PlusIcon className="w-4 h-4 text-primary" />
                </span>
              }
            >
              Upload data source
            </Button>
          </div>
          {!hasData && isSearching && <NoResults />}
          <div className="mt-5">
            {!isSourcingLocationsLoading && (
              <div className="flex justify-end w-full mb-4">
                <span className="text-sm text-gray-400">
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
        </>
      )}

      <UploadDataSourceModal
        open={isUploadDataSourceModalOpen}
        onDismiss={closeUploadDataSourceModal}
      />
    </AdminLayout>
  );
};

export default AdminDataPage;
