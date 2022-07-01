import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import TheService from 'containers/the-service';

const TheServicePage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>The Service - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
        </Head>

        <TheService />
      </>
    </ApplicationLayout>
  );
};

export default TheServicePage;
