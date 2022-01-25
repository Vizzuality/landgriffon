import AdminLayout, { TABS } from 'layouts/admin';

const AdminSettingsPage: React.FC = () => {
  return <AdminLayout currentTab={TABS.SETTINGS}>Settings</AdminLayout>;
};

export default AdminSettingsPage;
