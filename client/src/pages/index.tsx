import Head from 'next/head';
import ApplicationLayout from 'layouts/application';

const Home: React.FC = () => (
  <>
    <Head>
      <title>Welcome to Landgriffon</title>
    </Head>
    <ApplicationLayout>
      <p>Welcome</p>
    </ApplicationLayout>
  </>
);

export default Home;
