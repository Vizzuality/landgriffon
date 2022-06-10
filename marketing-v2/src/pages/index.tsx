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

        <h1 className="font-black uppercase font-display text-9xl">
          Unlock the sustainability of your supply chain
        </h1>
      </>
    </ApplicationLayout>
  );
};

export default Home;
