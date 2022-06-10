import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

const TheService: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>The service - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>
        TheService
      </>
    </ApplicationLayout>
  );
};

export default TheService;
