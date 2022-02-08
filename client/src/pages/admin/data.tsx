import { useMemo } from 'react';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import { ExclamationIcon, FilterIcon } from '@heroicons/react/solid';

import useModal from 'hooks/modals';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoData from 'containers/admin/no-data';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import Button from 'components/button';

type ITableData = ITableProps;

const TableNoSSR = dynamic(() => import('containers/table'), { ssr: false });

const AdminDataPage: React.FC = () => {
  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  const tableData = Array(100)
    .fill(undefined)
    .map((_, index) => ({
      material: `Rubber: ${index}`,
      businessUnit: `Accessories: ${index}`,
      t1Supplier: `The Supplier: ${index}`,
      producer: `Select Harvest: ${index}`,
      locationType: `Unknown: ${index}`,
      country: `China: ${index}`,
      id: index,
    }));

  const handleSearch = debounce(({ target }: { target: HTMLInputElement }): void => {
    console.info('Search: ', target.value);
  }, 200);

  const tableProps: ITableData = useMemo(
    () => ({
      rowKeyField: 'id',
      columns: [
        { key: 'material', title: 'Material', dataType: DataType.String, width: 240 },
        { key: 'businessUnit', title: 'Business Unit', dataType: DataType.String },
        { key: 't1Supplier', title: 'T1 Supplier', dataType: DataType.String },
        { key: 'producer', title: 'Producer', dataType: DataType.String },
        { key: 'locationType', title: 'Location Type', dataType: DataType.String },
        { key: 'country', title: 'Country', dataType: DataType.String },
      ],
      data: tableData,
    }),
    [tableData],
  );

  const hasData = tableData?.length > 0;

  return (
    <AdminLayout
      currentTab={ADMIN_TABS.DATA}
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

      {!hasData && <NoData />}

      {hasData && (
        <>
          <div className="flex flex-col-reverse md:flex-row justify-between items-center">
            <div className="flex w-full md:w-auto gap-2 mt-4">
              <input
                className="w-full md:w-auto bg-white border border-gray-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm font-medium"
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

          <TableNoSSR {...tableProps} />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDataPage;
