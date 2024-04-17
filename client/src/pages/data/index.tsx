import { useMemo } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { dehydrate } from '@tanstack/react-query';

import { auth } from '@/pages/api/auth/[...nextauth]';
import getQueryClient from '@/lib/react-query';
import { useSourcingLocations } from '@/hooks/sourcing-locations';
import AdminLayout from '@/layouts/admin';
import AdminDataUploader from '@/containers/admin/data-uploader';
import AdminDataTable from '@/containers/admin/data-table';
import Search from '@/components/search';
import { useLasTask } from '@/hooks/tasks';

const AdminDataPage: React.FC = () => {
  const { data, isFetched } = useSourcingLocations({
    fields: 'updatedAt',
    'page[number]': 1,
    'page[size]': 1,
  });
  const { data: lastTask, isFetched: lastTaskIsFetched } = useLasTask();

  const thereIsData = useMemo(
    () => isFetched && data?.meta?.totalItems > 0,
    [isFetched, data?.meta?.totalItems],
  );

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

      {thereIsData && lastTask?.status !== 'processing' && <AdminDataTable />}

      {(['processing', 'failed'].includes(lastTask?.status) ||
        (!lastTask && lastTaskIsFetched)) && <AdminDataUploader />}
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
