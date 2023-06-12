import Head from 'next/head';
import { useMemo } from 'react';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { PlusIcon } from '@heroicons/react/solid';

import { tasksSSR } from 'services/ssr';
import Button from 'components/button';
import Radio from 'components/forms/radio';
import Loading from 'components/loading';
import NoData from 'containers/admin/no-data';
import TargetsList from 'containers/targets/list';
import { useIndicators } from 'hooks/indicators';
import { useTargets } from 'hooks/targets';
import AdminLayout from 'layouts/admin';

import type { Target } from 'types';
import type { GetServerSideProps } from 'next';

const AdminTargetsPage: React.FC = () => {
  const { data: indicators } = useIndicators({}, { select: (data) => data.data });
  const { isLoading } = useTargets();
  const hasData = useMemo(() => indicators?.length > 0, [indicators]);

  // TO-DO: temporal targets
  const targets = useMemo<Target[]>(() => {
    if (indicators) {
      return indicators.map((indicator) => ({
        id: indicator.id,
        name: indicator.name.toString(),
        unit: indicator.metadata.units,
        indicatorId: indicator.id,
        baselineYear: 2020,
        baselineValue: 1,
        years: [
          { year: 2022, percentage: 0, value: 0 },
          { year: 2023, percentage: 0, value: 0 },
          { year: 2024, percentage: 0, value: 0 },
        ],
      }));
    }
    return [];
  }, [indicators]);

  return (
    <AdminLayout title="Targets">
      <Head>
        <title>Admin targets | Landgriffon</title>
      </Head>

      <div className="flex items-center justify-between">
        <div className="flex items-center py-2 text-xs text-black">
          <InformationCircleIcon className="w-4 h-4 mr-1 text-black" aria-hidden="true" />
          Target value for each indicator by year
        </div>
        <div className="flex space-x-4">
          <Radio name="absolutePercentage" id="absolute" checked>
            Absolute value
          </Radio>
          <Radio name="absolutePercentage" id="percentage" disabled>
            Percentage of reduction
          </Radio>
        </div>
        <div className="flex space-x-4">
          <Button
            icon={
              <div
                aria-hidden="true"
                className="flex items-center justify-center w-5 h-5 rounded-full bg-navy-400"
              >
                <PlusIcon className="w-4 h-4 text-white" />
              </div>
            }
            variant="secondary"
            disabled
          >
            Create a new target
          </Button>
        </div>
      </div>

      {!isLoading && !hasData && <NoData />}

      {isLoading && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <Loading />
        </div>
      )}

      {hasData && (
        <div className="my-6">
          <TargetsList data={targets} />
        </div>
      )}
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const tasks = await tasksSSR({ req, res });

  if (tasks && tasks[0]?.attributes.status === 'processing') {
    return {
      redirect: {
        permanent: false,
        destination: '/data',
      },
    };
  }

  return { props: { query } };
};

export default AdminTargetsPage;
