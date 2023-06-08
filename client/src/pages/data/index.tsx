import { useMemo } from 'react';
import Head from 'next/head';

import { useSourcingLocations } from 'hooks/sourcing-locations';
import { useTasks } from 'hooks/tasks';
import AdminLayout from 'layouts/admin';
import AdminDataUploader from 'containers/admin/data-uploader';
import AdminDataTable from 'containers/admin/data-table';
import Loading from 'components/loading';

import type { Task } from 'types';

const AdminDataPage: React.FC = () => {
  // Getting sourcing locations to check if there are any data
  const {
    data: sourcingLocations,
    isFetched: isSourcingLocationsFetched,
    isLoading: isSourcingLocationsLoading,
  } = useSourcingLocations({
    fields: 'updatedAt',
    'page[number]': 1,
    'page[size]': 1,
  });
  const thereIsData = useMemo(() => sourcingLocations?.meta?.totalItems > 0, [sourcingLocations]);

  // Getting last task available, this task is checking every 10 seconds if there is a new task
  const {
    data: tasks,
    isFetched: isTaskFetched,
    isLoading: isTasksLoading,
  } = useTasks(
    {
      'page[size]': 1,
      'page[number]': 1,
      sort: '-createdAt',
      include: 'user',
    },
    {
      refetchInterval: 10000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const isLoading = useMemo(
    () => isTasksLoading && isSourcingLocationsLoading,
    [isTasksLoading, isSourcingLocationsLoading],
  );

  const isFetched = useMemo(
    () => isTaskFetched && isSourcingLocationsFetched,
    [isTaskFetched, isSourcingLocationsFetched],
  );

  const lastTask: Task = tasks?.[0];

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
