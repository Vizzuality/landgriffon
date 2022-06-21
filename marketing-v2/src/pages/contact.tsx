import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

const Contact: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Contact - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>
        Contact
      </>
    </ApplicationLayout>
  );
};

export default Contact;
