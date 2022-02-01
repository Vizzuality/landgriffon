import AdminLayout, { ADMIN_TABS } from 'layouts/admin';

const AdminSettingsPage: React.FC = () => {
  return <AdminLayout currentTab={ADMIN_TABS.SETTINGS}>Settings</AdminLayout>;
};

export default AdminSettingsPage;
