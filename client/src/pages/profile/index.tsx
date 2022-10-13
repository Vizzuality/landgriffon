import Head from 'next/head';

import ApplicationLayout from 'layouts/application';
import UpdateProfileForm from 'containers/update-profile-form';
import UpdatePasswordForm from 'containers/update-password-form';

const UserProfile: React.FC = () => (
  <ApplicationLayout>
    <Head>
      <title>Edit profile - Landgriffon</title>
    </Head>

    <section
      aria-labelledby="primary-heading"
      className="min-w-0 flex-1 h-full flex flex-col overflow-y-auto p-6"
    >
      <h1 className="text-center md:text-left">Edit Profile</h1>
      <section className="pt-4 mt-4 pb-1 md:py-1">
        <UpdateProfileForm />
        <UpdatePasswordForm />
      </section>
    </section>
  </ApplicationLayout>
);

export default UserProfile;
