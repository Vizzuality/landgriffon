import Head from 'next/head';

import ProfileLayout from 'layouts/profile';
import UpdateProfileForm from 'containers/update-profile-form';
import UpdatePasswordForm from 'containers/update-password-form';

const UserProfile: React.FC = () => (
  <ProfileLayout title="Account">
    <Head>
      <title>Edit profile - Landgriffon</title>
    </Head>

    <section
      aria-labelledby="primary-heading"
      className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto p-6"
    >
      <h1 className="text-center md:text-left">Edit Profile</h1>
      <section className="mt-4 pb-1 pt-4 md:py-1">
        <UpdateProfileForm />
        <UpdatePasswordForm />
      </section>
    </section>
  </ProfileLayout>
);

export default UserProfile;
