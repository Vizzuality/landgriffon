import { useMemo, useState } from 'react';
import { merge } from 'lodash';
import Head from 'next/head';
import { PlusIcon, DownloadIcon, XCircleIcon } from '@heroicons/react/solid';
import { useDebounce } from '@react-hook/debounce';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import useModal from 'hooks/modals';
import { useSourcingLocations, useSourcingLocationsMaterials } from 'hooks/sourcing-locations';
import { useTasks } from 'hooks/tasks';
import AdminLayout from 'layouts/data';
import DownloadMaterialsDataButton from 'containers/admin/download-materials-data-button';
import NoResults from 'containers/admin/no-results';
import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import DataUploader from 'containers/data-uploader';
import Button, { Anchor } from 'components/button';
import Search from 'components/search';
import Modal from 'components/modal';
import Table from 'components/table';
import Loading from 'components/loading';

import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { ColumnDefinition } from 'components/table/column';
import type { SourcingLocation, Task } from 'types';

const AdminDataPage: React.FC = () => {
  const [searchText, setSearchText] = useDebounce('', 250);
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 1,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Getting sourcing locations to extract the update date
  const { data: sourcingLocations, isLoading: isSourcingLocationsLoading } = useSourcingLocations({
    fields: 'updatedAt',
    'page[number]': 1,
    'page[size]': 1,
  });

  const {
    data: sourcingData,
    meta: sourcingMetadata,
    isFetched: isFetchedSourcingData,
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

  // Getting last task available
  const {
    data: tasks,
    isLoading: tasksIsLoading,
    isFetched: tasksIsFetched,
  } = useTasks(
    {
      'page[size]': 1,
      sort: '-createdAt',
    },
    {
      refetchInterval: 10000,
    },
  );
  const lastTask = tasks?.[0] as Task;

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
          .map(({ year, tonnage }) => ({ [year]: tonnage }))
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
    <AdminLayout title="Manage data">
      <Head>
        <title>Manage data | Landgriffon</title>
      </Head>

      {(tasksIsLoading || isFetchingSourcingData) && (
        <div className="flex items-center justify-center w-full h-full">
          <Loading className="w-5 h-5 text-navy-400" />
        </div>
      )}

      {/* Content when empty */}
      {tasksIsFetched &&
        isFetchedSourcingData &&
        (lastTask?.status === 'processing' || sourcingLocations.data.length === 0) && (
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
                  icon={<DownloadIcon aria-hidden="true" />}
                >
                  Download template
                </Anchor>
              </div>
              <div className="space-y-4 text-lg text-center">
                <p className="font-semibold">2. Upload the filled Excel file.</p>
                <DataUploader task={lastTask} />

                {lastTask?.errors.length > 0 && (
                  <div className="p-4 mt-6 text-sm text-left text-red-400 rounded-md bg-red-50">
                    <p>
                      <XCircleIcon className="inline-block w-5 h-5 mr-2 text-red-400 align-top" />
                      There {lastTask.errors.length === 1 ? 'is' : 'are'} {lastTask.errors.length}{' '}
                      error
                      {lastTask.errors.length > 1 && 's'} with your file. Please correct them and
                      try again.
                    </p>
                    <ul className="pl-12 mt-2 space-y-2 list-disc">
                      {lastTask.errors.map((error) =>
                        Object.values(error).map((errorMessage) => (
                          <li key={errorMessage}>{errorMessage}</li>
                        )),
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Content when data */}
      {isFetchedSourcingData && sourcingLocations.data?.length > 0 && (
        <div className="flex flex-col h-full space-y-6">
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
            <DownloadMaterialsDataButton onError={(errorMessage) => toast.error(errorMessage)} />
            <Button
              variant="primary"
              onClick={openUploadDataSourceModal}
              icon={
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center w-5 h-5 bg-white rounded-full"
                >
                  <PlusIcon className="w-4 h-4 text-navy-400" />
                </div>
              }
              disabled={lastTask?.status === 'processing'}
            >
              Upload data source
            </Button>
          </div>
          {!hasData && isSearching && <NoResults />}
          {!isSourcingLocationsLoading && (
            <div className="flex justify-end w-full">
              <span className="text-sm text-gray-400">
                Last update: {format(new Date(sourcingLocations.data[0].updatedAt), 'd MMM yyyy')}
              </span>
            </div>
          )}
          <div className="flex-1 overflow-auto">
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
        </div>
      )}

      <Modal
        title="Upload data source"
        open={isUploadDataSourceModalOpen}
        onDismiss={closeUploadDataSourceModal}
        theme="default"
      >
        <div>
          <div>
            <p className="text-sm text-gray-500">
              Upload a new file will replace all the current data.
            </p>
            <div className="mt-10">
              <DataUploader inline task={lastTask} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="secondary" onClick={closeUploadDataSourceModal}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminDataPage;
