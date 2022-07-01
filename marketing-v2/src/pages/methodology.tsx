import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Methodology from 'containers/methodology';

const MethodologyPage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Methodology - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
        </Head>

        <Methodology />
      </>
    </ApplicationLayout>
  );
};

export default MethodologyPage;
