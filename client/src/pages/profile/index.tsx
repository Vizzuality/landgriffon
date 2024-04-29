import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { dehydrate } from '@tanstack/react-query';

import { auth } from '@/pages/api/auth/[...nextauth]';
import ProfileLayout from 'layouts/profile';
import UpdateProfileForm from 'containers/update-profile-form';
import UpdatePasswordForm from 'containers/update-password-form';
import getQueryClient from '@/lib/react-query';

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await auth(ctx.req, ctx.res);
  const queryClient = getQueryClient();

  queryClient.setQueryData(['profile', session.accessToken], session.user);

  return {
    props: {
      session,
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default UserProfile;
