import { useCallback, useMemo } from 'react';
import Head from 'next/head';
import { InformationCircleIcon } from '@heroicons/react/solid';

import { useTargets } from 'hooks/targets';
import { useIndicators } from 'hooks/indicators';

import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoData from 'containers/admin/no-data';
import TargetsList from 'containers/targets/list';
import Button from 'components/button';
import Loading from 'components/loading';

import type { Target } from 'types';
import Radio from 'components/forms/radio';

const AdminTargetsPage: React.FC = () => {
  const { data: indicators } = useIndicators();
  const { isLoading } = useTargets();
  const hasData = indicators?.length > 0;

  const handleCreateTarget = useCallback(() => console.log('create a new target'), []);
  // TO-DO: temporal targets
  const targets = useMemo<Target[]>(() => {
    if (indicators) {
      return indicators.map((indicator) => ({
        id: indicator.id,
        name: indicator.name,
        indicatorId: indicator.id,
        baselineYear: 2020,
        baselineValue: 1,
        years: [
          { year: 2022, value: 0 },
          { year: 2023, value: 0 },
          { year: 2024, value: 0 },
        ],
      }));
    }
    return [];
  }, [indicators]);

  return (
    <AdminLayout
      currentTab={ADMIN_TABS.TARGETS}
      headerButtons={
        <>
          <Button theme="primary" onClick={handleCreateTarget}>
            Create a new target
          </Button>
        </>
      }
    >
      <Head>
        <title>Admin targets | Landgriffon</title>
      </Head>

      {!isLoading && !hasData && <NoData />}

      {isLoading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loading />
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-black py-2">
              <InformationCircleIcon className="w-5 h-5 mr-3 text-black" aria-hidden="true" />
              Target value for each indicator by year
            </div>
            <div className="flex justify-end text-sm space-x-4">
              <Radio name="absolutePercentage" id="absolute">
                Absolute value
              </Radio>
              <Radio name="absolutePercentage" id="percentage">
                Percentage of reduction
              </Radio>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            <TargetsList data={targets} />
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminTargetsPage;
