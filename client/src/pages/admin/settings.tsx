import Head from 'next/head';
import AdminLayout, { ADMIN_TABS } from 'layouts/admin';

const AdminSettingsPage: React.FC = () => {
  return (
    <AdminLayout currentTab={ADMIN_TABS.SETTINGS}>
      <Head>
        <title>Admin settings | Landgriffon</title>
      </Head>
      Settings
    </AdminLayout>
  );
};

export default AdminSettingsPage;
