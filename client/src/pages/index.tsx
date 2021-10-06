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
      destination: '/analysis',
      permanent: false,
    },
  };
}

export default Home;
