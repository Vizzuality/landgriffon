import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import UpdateProfileForm from 'containers/update-profile-form';
import UpdatePasswordForm from 'containers/update-password-form';

const UserProfile: React.FC = () => (
  <ApplicationLayout>
    <Head>
      <title>Edit profile - Landgriffon</title>
    </Head>

    <div className="flex-col">
      <h1 className="mt-6 ml-6">Edit profile</h1>

      <UpdateProfileForm />

      <UpdatePasswordForm />
    </div>
  </ApplicationLayout>
);

export default UserProfile;
