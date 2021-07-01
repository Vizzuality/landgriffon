import Head from 'next/head';
import AuthenticationLayout from 'layouts/authentication';

const Home: React.FC = () => (
  <>
    <Head>
      <title>Sign in</title>
    </Head>
    <AuthenticationLayout />
  </>
);

export default Home;
