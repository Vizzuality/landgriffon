import { useMemo } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { dehydrate } from '@tanstack/react-query';

import { auth } from '@/pages/api/auth/[...nextauth]';
import { useSourcingLocations } from 'hooks/sourcing-locations';
import { useLasTask } from 'hooks/tasks';
import AdminLayout from 'layouts/admin';
import AdminDataUploader from 'containers/admin/data-uploader';
import AdminDataTable from 'containers/admin/data-table';
import Loading from 'components/loading';
import Search from 'components/search';
import getQueryClient from '@/lib/react-query';

const AdminDataPage: React.FC = () => {
  // Getting sourcing locations to check if there are any data
  const { data, isFetched, isLoading } = useSourcingLocations({
    fields: 'updatedAt',
    'page[number]': 1,
    'page[size]': 1,
  });

  // Getting last task to check if there is a processing task
  const { data: lastTask } = useLasTask();

  const thereIsData = useMemo(() => data?.meta?.totalItems > 0, [data?.meta?.totalItems]);

  return (
    <AdminLayout
      title="Manage data"
      searchSection={
        <Search
          placeholder="Search by material..."
          data-testid="search-name-scenario"
          className="border-none"
          searchQuery="search"
          disabled
        />
      }
    >
      <Head>
        <title>Manage data | Landgriffon</title>
      </Head>

      {(!isFetched || isLoading) && (
        <div className="flex h-full w-full items-center justify-center">
          <Loading className="h-5 w-5 text-navy-400" />
        </div>
      )}

      {/* Content when empty, or upload is processing or failed */}
      {isFetched && !thereIsData && <AdminDataUploader task={lastTask} />}

      {/* Content when data and upload is completed */}
      {isFetched && thereIsData && <AdminDataTable task={lastTask} />}
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await auth(ctx.req, ctx.res);
  const queryClient = getQueryClient();

  queryClient.setQueryData(['profile', session.accessToken], session.user);

  return {
    props: {
      session,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default AdminDataPage;
