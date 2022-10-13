import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/solid';

import { useScenarios } from 'hooks/scenarios';

import AdminLayout from 'layouts/data';
import ScenarioCard from 'containers/scenarios/card';
import { Anchor } from 'components/button';
import Loading from 'components/loading';

const ScenariosAdminPage: React.FC = () => {
  const { data, isLoading } = useScenarios({
    params: { disablePagination: true },
    options: { select: (data) => data.data },
  });

  return (
    <AdminLayout title="Manage scenarios data">
      <Head>
        <title>Admin scenarios | Landgriffon</title>
      </Head>
      <div className="flex justify-end mb-6">
        <Link href="/data/scenarios/new" passHref>
          <Anchor
            variant="primary"
            data-testid="scenario-add-button"
            icon={
              <div
                aria-hidden="true"
                className="flex items-center justify-center w-5 h-5 bg-white rounded-full"
              >
                <PlusIcon className="w-4 h-4 text-navy-400" />
              </div>
            }
          >
            Add new scenario
          </Anchor>
        </Link>
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
