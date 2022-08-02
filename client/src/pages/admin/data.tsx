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

import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { ColumnDefinition } from 'components/newTable/column';
import type { SourcingLocation } from 'types';

const AdminDataPage: React.FC = () => {
  const [searchText, setSearchText] = useDebounce('', 250);
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 1,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dataDownloadError, setDataDownloadError] = useState<string>();

  const {
    data: sourcingData,
    meta: sourcingMetadata,
    isFetching: isFetchingSourcingData,
  } = useSourcingLocationsMaterials({
    ...(sorting[0] && {
      // Even though in the data the key is `materialName`, the endpoint
      // expects it to be `material` when using filters.
      orderBy: sorting[0].id === 'materialName' ? 'material' : sorting[0].id,
      order: sorting[0].desc ? 'desc' : 'asc',
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

  if (data?.[0]) {
    data[0].children = [
      {
        ...data[0],
        material: 'CHILD',
        children: [{ ...data[0], material: 'GRANDCHILD' }],
      },
    ];
  }

  const yearsColumns = useMemo<ColumnDefinition<SourcingLocation[], string>[]>(
    () =>
      yearsData.columns.map((column) => ({
        id: column.id,
        title: column.title,
        enableHiding: !column.visible,
        size: 70,
      })),
    [yearsData.columns],
  );

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
        onSortingChange={setSorting}
        columns={[
          {
            id: 'material',
            title: 'Material',
            size: 280,
            align: 'left',
            isSticky: true,
            enableSorting: true,
          },
          { id: 'businessUnit', title: 'Business Unit' },
          { id: 't1Supplier', title: 'T1 Supplier' },
          { id: 'producer', title: 'Producer' },
          { id: 'locationType', title: 'Location Type' },
          { id: 'country', title: 'Country' },
          ...yearsColumns,
        ]}
        state={{
          pagination: {
            pageIndex: sourcingMetadata.page,
            pageSize: sourcingMetadata.size,
          },
          sorting,
        }}
        totalItems={sourcingMetadata.totalItems}
        pageCount={sourcingMetadata.totalPages}
        onPaginationChange={setPagination}
      />
    </AdminLayout>
  );
};

export default AdminDataPage;
