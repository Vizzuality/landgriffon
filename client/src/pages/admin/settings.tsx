import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import { withProtection } from 'lib/hoc/auth';

export const getServerSideProps = withProtection();

const AdminSettingsPage: React.FC = () => {
  return <AdminLayout currentTab={ADMIN_TABS.SETTINGS}>Settings</AdminLayout>;
};

export default AdminSettingsPage;
