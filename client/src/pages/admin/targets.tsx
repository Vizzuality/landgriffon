import { ITableProps } from 'ka-table';
import { DataType, PagingPosition } from 'ka-table/enums';
import dynamic from 'next/dynamic';

import useModal from 'hooks/modals';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoData from 'containers/admin/no-data';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import Button from 'components/button';

type ITableData = ITableProps;

const TableNoSSR = dynamic(() => import('components/table'), { ssr: false });

const columns = [
  { key: 'indicator', title: 'Indicator', dataType: DataType.String },
  { key: 'baselineYear', title: 'Baseline Year', dataType: DataType.Number },
];

const tableProps: ITableData = {
  columns,
  rowKeyField: 'id',
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 10,
    pageSizes: [10, 25, 50, 75, 100],
    position: PagingPosition.Bottom,
  },
};

const AdminTargetsPage: React.FC = () => {
  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  const data = Array(4)
    .fill(undefined)
    .map((_, index) => ({
      indicator: `Deforestation loss due to land use change: ${index}`,
      baselineYear: 2018,
      id: index,
    }));

  const hasData = data?.length > 0;

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

      {hasData && <TableNoSSR tablePropsInit={{ ...tableProps, data: data }} />}
    </AdminLayout>
  );
};

export default AdminTargetsPage;
