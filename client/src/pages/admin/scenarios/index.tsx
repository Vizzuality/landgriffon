import Head from 'next/head';
import Link from 'next/link';

import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import ScenarioCard from 'containers/scenarios/card';
import { AnchorLink } from 'components/button';
import { PlusIcon } from '@heroicons/react/solid';

const ScenariosAdminPage: React.FC = () => {
  const data = [0, 1, 2, 3, 4, 5, 6];

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
      <div className="grid grid-cols-3 gap-6">
        {data.map((i) => (
          <ScenarioCard key={`scenario-card-${i}`} />
        ))}
      </div>
    </AdminLayout>
  );
};

export default ScenariosAdminPage;
