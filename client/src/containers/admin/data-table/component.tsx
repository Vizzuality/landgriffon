import { useEffect, useMemo, useState } from 'react';
import { PlusIcon, DownloadIcon } from '@heroicons/react/solid';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import useModal from 'hooks/modals';
import {
  useSourcingLocations,
  useSourcingLocationsMaterials,
  useSourcingLocationsMaterialsTabularData,
} from 'hooks/sourcing-locations';
import DownloadMaterialsDataButton from 'containers/admin/download-materials-data-button';
import DataUploadError from 'containers/admin/data-upload-error';
import DataUploader from 'containers/uploader';
import Button, { Anchor } from 'components/button';
import Modal from 'components/modal';
import Table from 'components/table';
import { DEFAULT_PAGE_SIZES } from 'components/table/pagination/constants';
import { usePermissions } from 'hooks/permissions';
import { RoleName } from 'hooks/permissions/enums';

import type { PaginationState, SortingState, VisibilityState } from '@tanstack/react-table';
import type { TableProps } from 'components/table/component';
import type { Task } from 'types';

const YEARS_COLUMNS_UNIT = 't/yr';

const AdminDataPage: React.FC<{ task: Task }> = ({ task }) => {
  const { push, query } = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: session } = useSession();

  const { hasRole } = usePermissions();
  const isAdmin = hasRole(RoleName.ADMIN);

  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: DEFAULT_PAGE_SIZES[0],
    pageIndex: !!query.page ? Number(query.page) : 1,
  });

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
      'page[size]': pagination.pageSize,
      'page[number]': pagination.pageIndex,
    },
    {
      keepPreviousData: true,
    },
  );

  const { yearsData, data } = useSourcingLocationsMaterialsTabularData(sourcingData);

  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  /** Data for the table */
  const yearsColumns = useMemo(
    () =>
      yearsData.columns.map((column) => ({
        id: column.id,
        title: column.title,
        isVisible: column.visible,
        cell: ({ row }) => <div>{`${row.original?.[column.id]} ${YEARS_COLUMNS_UNIT}`}</div>,
      })),
    [yearsData.columns],
  );

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
        cell: ({ row }) => (
          <div className="flex align-center my-[30px]">{row.original?.material as string}</div>
        ),
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
        <div className="flex w-full gap-2 justify-end">
          <DownloadMaterialsDataButton />
          <Button
            variant="primary"
            onClick={openUploadDataSourceModal}
            disabled={!isAdmin}
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

        {task.user?.email === session.user?.email && <DataUploadError task={task} />}

        {!isSourcingLocationsLoading && (
          <div className="flex justify-end w-full">
            <div className="text-sm text-gray-400">
              <span className="text-navy-400 underline">Last update</span> at{' '}
              {format(new Date(sourcingLocations.data[0].updatedAt), 'd MMM yyyy HH:mm z')}
              {task?.user && ' by '}
              {task?.user?.displayName || task?.user?.email}
            </div>
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
            noDataMessage="No data found"
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
              <DataUploader variant="inline" isProcessing={task?.status === 'processing'} />
              {task?.status !== 'processing' && <DataUploadError task={task} />}
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-8">
            <div>
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
            </div>
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
