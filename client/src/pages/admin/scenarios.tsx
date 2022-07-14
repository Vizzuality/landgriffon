import Head from 'next/head';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import ScenarioCard from 'containers/scenarios/card';

const AdminSettingsPage: React.FC = () => {
  const data = [0, 1, 2, 3, 4, 5, 6];

  return (
    <AdminLayout currentTab={ADMIN_TABS.SCENARIOS} title="Manage scenarios data">
      <Head>
        <title>Admin scenarios | Landgriffon</title>
      </Head>
      <div className="grid grid-cols-3 gap-6">
        {data.map((i) => (
          <ScenarioCard key={`scenario-card-${i}`} />
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
