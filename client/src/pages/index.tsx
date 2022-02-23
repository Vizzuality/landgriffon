import Head from 'next/head';
import ApplicationLayout from 'layouts/application';
import type { Redirect } from 'next';

const Home: React.FC = () => (
  <>
    <Head>
      <title>Welcome to Landgriffon</title>
    </Head>
    <ApplicationLayout>{/* Welcome */}</ApplicationLayout>
  </>
);

export async function getServerSideProps(): Promise<{ redirect: Redirect }> {
  return {
    redirect: {
      destination: '/analysis',
      permanent: false,
    },
  };
}

export default Home;
