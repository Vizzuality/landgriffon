import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

const Home: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Welcome - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>
        Home
      </>
    </ApplicationLayout>
  );
};

export default Home;
