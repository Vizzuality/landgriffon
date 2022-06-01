import { useMemo } from 'react';
import Head from 'next/head';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';
import dynamic from 'next/dynamic';
import { InformationCircleIcon } from '@heroicons/react/solid';

import useModal from 'hooks/modals';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoData from 'containers/admin/no-data';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import Button from 'components/button';

type ITableData = ITableProps;

const TableNoSSR = dynamic(() => import('components/table'), { ssr: false });

const AdminTargetsPage: React.FC = () => {
  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  const tableData = Array(4)
    .fill(undefined)
    .map((_, index) => ({
      indicator: `Deforestation loss due to land use change: ${index}`,
      baselineYear: 2018,
      id: index,
    }));

  const tableProps: ITableData = useMemo(
    () => ({
      rowKeyField: 'id',
      columns: [
        { key: 'indicator', title: 'Indicator', dataType: DataType.String, width: 100 },
        { key: 'baselineYear', title: 'Baseline Year', dataType: DataType.Number },
      ],
      data: tableData,
    }),
    [tableData],
  );

  const hasData = tableData?.length > 0;

  return (
    <AdminLayout
      currentTab={ADMIN_TABS.TARGETS}
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
      <Head>
        <title>Admin targets | Landgriffon</title>
      </Head>

      <UploadDataSourceModal
        open={isUploadDataSourceModalOpen}
        onDismiss={closeUploadDataSourceModal}
      />

      {!hasData && <NoData />}

      {hasData && (
        <>
          <div className="flex items-center text-sm text-black py-2">
            <InformationCircleIcon className="w-5 h-5 mr-3 text-black" aria-hidden="true" />
            Target value for each indicator by year (percentage of reduction)
          </div>
          <TableNoSSR {...tableProps} />
        </>
      )}
    </AdminLayout>
  );
};

export default AdminTargetsPage;
