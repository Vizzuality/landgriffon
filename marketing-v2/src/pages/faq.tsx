import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

const FAQ: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>FAQ - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>
        FAQ
      </>
    </ApplicationLayout>
  );
};

export default FAQ;
