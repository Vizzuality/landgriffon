import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

const Methodology: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Methodology - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>
        Methodology
      </>
    </ApplicationLayout>
  );
};

export default Methodology;
