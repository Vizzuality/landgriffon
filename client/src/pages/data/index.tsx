import Head from 'next/head';

import { useSourcingLocations } from 'hooks/sourcing-locations';
import { useLasTask } from 'hooks/tasks';
import AdminLayout from 'layouts/admin';
import AdminDataUploader from 'containers/admin/data-uploader';
import AdminDataTable from 'containers/admin/data-table';
import Loading from 'components/loading';

const AdminDataPage: React.FC = () => {
  // Getting sourcing locations to check if there are any data
  const { data, isFetched, isLoading } = useSourcingLocations({
    fields: 'updatedAt',
    'page[number]': 1,
    'page[size]': 1,
  });

  // Getting last task to check if there is a processing task
  const { data: lastTask } = useLasTask();

  const thereIsData = data?.meta?.totalItems > 0;

  return (
    <AdminLayout title="Manage data">
      <Head>
        <title>Manage data | Landgriffon</title>
      </Head>

      {(!isFetched || isLoading) && (
        <div className="flex items-center justify-center w-full h-full">
          <Loading className="w-5 h-5 text-navy-400" />
        </div>
      )}

      {/* Content when empty, or upload is processing or failed */}
      {isFetched && (lastTask?.status === 'processing' || !thereIsData) && (
        <AdminDataUploader task={lastTask} />
      )}

      {/* Content when data and upload is completed */}
      {isFetched && thereIsData && <AdminDataTable task={lastTask} />}
    </AdminLayout>
  );
};

export default AdminDataPage;
