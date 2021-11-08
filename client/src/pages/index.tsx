import Head from 'next/head';
import ApplicationLayout from 'layouts/application';

const Home: React.FC = () => (
  <>
    <Head>
      <title>Welcome to Landgriffon</title>
    </Head>
    <ApplicationLayout>{/* Welcome */}</ApplicationLayout>
  </>
);

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/auth/sign-in',
      permanent: false,
    },
  };
}

export default Home;
