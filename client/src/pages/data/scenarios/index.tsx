import { useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PlusIcon, SortDescendingIcon } from '@heroicons/react/solid';

import Select from 'components/forms/select';
import { useScenarios } from 'hooks/scenarios';
import AdminLayout from 'layouts/data';
import ScenarioCard from 'containers/scenarios/card';
import { Anchor } from 'components/button';
import Loading from 'components/loading';

const SORT_OPTIONS = [
  {
    label: 'Sort by most recent',
    value: '-updatedAt',
  },
  {
    label: 'Sort by name',
    value: 'title',
  },
];

const ScenariosAdminPage: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  const handleSort = useCallback(
    ({ value }) => {
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...query,
            sortBy: value,
          },
        },
        null,
        { shallow: true },
      );
    },
    [router, query],
  );

  const currentSort = useMemo(
    () => SORT_OPTIONS.find(({ value }) => value === query.sortBy) || SORT_OPTIONS[0],
    [query.sortBy],
  );

  const { data, isLoading } = useScenarios({
    params: { disablePagination: true, sort: currentSort.value },
    options: { select: (data) => data.data },
  });

  return (
    <AdminLayout title="Manage scenarios data">
      <Head>
        <title>Admin scenarios | Landgriffon</title>
      </Head>
      <div className="flex justify-end mb-6">
        <div className="flex space-x-4">
          <Select
            value={currentSort}
            options={SORT_OPTIONS}
            onChange={handleSort}
            icon={<SortDescendingIcon className="w-4 h-4" />}
            data-testid="sort-scenario"
          />
          <div>
            {/*  view options go here */}
            <Link href="/data/scenarios/new" passHref>
              <Anchor
                variant="secondary"
                data-testid="scenario-add-button"
                icon={
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-navy-400"
                  >
                    <PlusIcon className="w-4 h-4 text-white" />
                  </div>
                }
              >
                Add scenario
              </Anchor>
            </Link>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="flex justify-center">
          <Loading className="w-5 h-5 text-navy-400" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {!isLoading &&
          data?.map((scenarioData) => (
            <ScenarioCard key={`scenario-card-${scenarioData.id}`} data={scenarioData} />
          ))}
      </div>
    </AdminLayout>
  );
};

export default ScenariosAdminPage;
