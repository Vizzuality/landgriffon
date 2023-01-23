import { useEffect, useMemo, useState } from 'react';
import { merge } from 'lodash-es';
import { PlusIcon, DownloadIcon } from '@heroicons/react/solid';
import { useDebounceCallback } from '@react-hook/debounce';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

import useModal from 'hooks/modals';
import { useSourcingLocations, useSourcingLocationsMaterials } from 'hooks/sourcing-locations';
import DownloadMaterialsDataButton from 'containers/admin/download-materials-data-button';
import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import DataUploader from 'containers/uploader';
import Button, { Anchor } from 'components/button';
import Search from 'components/search';
import Modal from 'components/modal';
import Table from 'components/table';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';
import { usePermissions } from 'hooks/permissions';
import { RoleName } from 'hooks/permissions/enums';

import type { PaginationState, SortingState, VisibilityState } from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';

const AdminDataPage: React.FC = () => {
  const { push, query } = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  // Permissions
  const { hasRole } = usePermissions();
  const canUploadDataSource = hasRole(RoleName.ADMIN);

  // Search
  const [searchText, setSearchText] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: DEFAULT_PAGE_SIZES[0],
    pageIndex: !!query.page ? Number(query.page) : 1,
  });
  const handleSearch = useDebounceCallback((term) => {
    setSearchText(term);
    // reset pagination to first page when search term changes
    setPagination(() => ({ ...pagination, pageIndex: 1 }));
  }, 600);

  // Getting sourcing locations to extract the update date
  const { data: sourcingLocations, isLoading: isSourcingLocationsLoading } = useSourcingLocations({
    fields: 'updatedAt',
    'page[number]': 1,
    'page[size]': 1,
  });

  const {
    data: sourcingData,
    meta: sourcingMetadata,
    isFetching: isSourcingDataFetching,
  } = useSourcingLocationsMaterials(
    {
      ...(sorting[0] && {
        orderBy: sorting[0].id,
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
  // Getting all the years from the data
  const yearsFromData = useMemo(
    () =>
      Array.from(
        new Set(sourcingData.flatMap(({ purchases }) => purchases.map((p) => p.year))),
      ).sort(),
    [sourcingData],
  );

  // Getting the years range by filtering the years from the data
  const { startYear, endYear, yearsInRange, setYearsRange } = useYearsRange({
    years: yearsFromData,
  });

  // Preparing table columns by years from the range of filters
  const yearsData = useMemo(() => {
    return {
      columns: yearsFromData.map((year) => ({
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
  }, [yearsFromData, sourcingData, yearsInRange]);

  /** Data fot the table */
  const yearsColumns = useMemo(
    () =>
      yearsData.columns.map((column) => ({
        id: column.id,
        title: column.title,
        isVisible: column.visible,
      })),
    [yearsData.columns],
  );
  const data = useMemo(() => merge(sourcingData, yearsData.data), [sourcingData, yearsData.data]);

  /** Table */
  const columns = useMemo<TableProps<Record<string, unknown>>['columns']>(
    () => [
      {
        id: 'material',
        header: 'Material',
        size: 280,
        align: 'left',
        isSticky: 'left',
        enableSorting: true,
      },
      {
        id: 'businessUnit',
        header: 'Business Unit',
        enableSorting: true,
      },
      {
        id: 't1Supplier',
        eader: 'T1 Supplier',
        enableSorting: true,
      },
      {
        id: 'producer',
        header: 'Producer',
        enableSorting: true,
      },
      {
        id: 'locationType',
        header: 'Location Type',
        enableSorting: true,
      },
      {
        id: 'country',
        header: 'Country',
        enableSorting: true,
      },
      ...yearsColumns,
    ],
    [yearsColumns],
  );

  const columnVisibility = useMemo<VisibilityState>(
    () => yearsColumns.reduce((a, b) => ({ ...a, [b.id]: b.isVisible }), {}),
    [yearsColumns],
  );

  useEffect(() => {
    if (pagination.pageIndex && pagination.pageIndex !== Number(query.page)) {
      push({ query: { ...query, page: pagination.pageIndex } }, null, { shallow: true });
    }
  }, [pagination.pageIndex, query, push]);

  return (
    <>
      <div className="flex flex-col h-full space-y-6">
        <div className="flex w-full gap-2">
          <div className="flex-1">
            <Search
              defaultValue={searchText}
              placeholder="Search table"
              onChange={handleSearch}
              autoFocus
            />
          </div>
          <YearsRangeFilter
            startYear={startYear}
            endYear={endYear}
            years={yearsFromData}
            onChange={setYearsRange}
            placeholderFrom="Select a year"
            placeholderTo="Select a year"
          />
          <DownloadMaterialsDataButton onError={(errorMessage) => toast.error(errorMessage)} />
          <Button
            variant="primary"
            onClick={openUploadDataSourceModal}
            disabled={!canUploadDataSource}
            data-testid="upload-data-source-btn"
            icon={
              <div
                aria-hidden="true"
                className="flex items-center justify-center w-5 h-5 bg-white rounded-full"
              >
                <PlusIcon className="w-4 h-4 text-navy-400" />
              </div>
            }
          >
            Upload data source
          </Button>
        </div>

        {!isSourcingLocationsLoading && (
          <div className="flex justify-end w-full">
            <span className="text-sm text-gray-400">
              Last update: {format(new Date(sourcingLocations.data[0].updatedAt), 'd MMM yyyy')}
            </span>
          </div>
        )}

        <div className="flex-1">
          <Table
            columns={columns}
            theme="striped"
            isLoading={isSourcingDataFetching}
            data={data}
            state={{
              pagination: {
                pageIndex: sourcingMetadata.page,
                pageSize: sourcingMetadata.size,
              },
              sorting,
              columnVisibility,
            }}
            paginationProps={{
              totalItems: sourcingMetadata.totalItems,
              totalPages: sourcingMetadata.totalPages,
              currentPage: sourcingMetadata.page,
              pageSize: sourcingMetadata.size,
            }}
            enableRowSelection={false}
            enableSubRowSelection={false}
            enableMultiRowSelection={false}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            noDataMessage={
              sourcingData.length === 0 && searchText !== '' ? (
                <span>
                  No data found for the search term <strong>{searchText}</strong>
                </span>
              ) : (
                'No data found'
              )
            }
          />
        </div>
      </div>

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
              <DataUploader variant="inline" />
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-8">
            <p>
              <Anchor
                href="/files/data-template.xlsx"
                download
                target="_blank"
                rel="noopener noreferrer"
                icon={<DownloadIcon aria-hidden="true" />}
                variant="white"
              >
                Download template
              </Anchor>
            </p>
            <Button variant="secondary" onClick={closeUploadDataSourceModal}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminDataPage;
