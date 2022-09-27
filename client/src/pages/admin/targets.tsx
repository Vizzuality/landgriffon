import Button from 'components/button';
import Radio from 'components/forms/radio';
import Loading from 'components/loading';
import NoData from 'containers/admin/no-data';
import TargetsList from 'containers/targets/list';
import { useIndicators } from 'hooks/indicators';
import { useTargets } from 'hooks/targets';
import AdminLayout from 'layouts/admin';
import Head from 'next/head';
import { useCallback, useMemo } from 'react';

import { InformationCircleIcon } from '@heroicons/react/solid';

import type { Target } from 'types';

const AdminTargetsPage: React.FC = () => {
  const { data: indicators } = useIndicators({ select: (data) => data.data });
  const { isLoading } = useTargets();
  const hasData = indicators?.length > 0;

  const handleCreateTarget = useCallback(() => console.log('create a new target'), []);
  // TO-DO: temporal targets
  const targets = useMemo<Target[]>(() => {
    if (indicators) {
      return indicators.map((indicator) => ({
        id: indicator.id,
        name: indicator.name.toString(),
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

      <div className="flex justify-end gap-3">
        <Button theme="primary" onClick={handleCreateTarget}>
          Create a new target
        </Button>
      </div>

      {!isLoading && !hasData && <NoData />}

      {isLoading && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <Loading />
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center py-2 text-sm text-black">
              <InformationCircleIcon className="w-5 h-5 mr-3 text-black" aria-hidden="true" />
              Target value for each indicator by year
            </div>
            <div className="flex justify-end space-x-4 text-sm">
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
