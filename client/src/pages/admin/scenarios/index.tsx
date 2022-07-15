import Head from 'next/head';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/solid';

import { useScenarios } from 'hooks/scenarios';

import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import ScenarioCard from 'containers/scenarios/card';
import { AnchorLink } from 'components/button';
import Loading from 'components/loading';

const ScenariosAdminPage: React.FC = () => {
  const { data, isLoading } = useScenarios({
    params: { disablePagination: true },
  });

  return (
    <AdminLayout currentTab={ADMIN_TABS.SCENARIOS} title="Manage scenarios data">
      <Head>
        <title>Admin scenarios | Landgriffon</title>
      </Head>
      <div className="flex justify-end mb-6">
        <Link href="/admin/scenarios/new" passHref>
          <AnchorLink theme="primary">
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            Add scenario
          </AnchorLink>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {isLoading && <Loading />}
        {!isLoading &&
          data &&
          data.map((scenarioData) => (
            <ScenarioCard key={`scenario-card-${scenarioData.id}`} data={scenarioData} />
          ))}
      </div>
    </AdminLayout>
  );
};

export default ScenariosAdminPage;
