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
      className="flex flex-col flex-1 h-full min-w-0 p-6 overflow-y-auto"
    >
      <h1 className="text-center md:text-left">Edit Profile</h1>
      <section className="pt-4 pb-1 mt-4 md:py-1">
        <UpdateProfileForm />
        <UpdatePasswordForm />
      </section>
    </section>
  </ProfileLayout>
);

export default UserProfile;
