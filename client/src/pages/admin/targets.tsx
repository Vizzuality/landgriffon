import { useMemo } from 'react';
import { ITableProps } from 'ka-table';
import { DataType } from 'ka-table/enums';
import dynamic from 'next/dynamic';

import useModal from 'hooks/modals';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoData from 'containers/admin/no-data';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import Button from 'components/button';

type ITableData = ITableProps;

const TableNoSSR = dynamic(() => import('containers/table'), { ssr: false });

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
        { key: 'indicator', title: 'Indicator', dataType: DataType.String, width: 80 },
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
      <UploadDataSourceModal
        open={isUploadDataSourceModalOpen}
        onDismiss={closeUploadDataSourceModal}
      />

      {!hasData && <NoData />}

      {hasData && <TableNoSSR {...tableProps} />}
    </AdminLayout>
  );
};

export default AdminTargetsPage;
