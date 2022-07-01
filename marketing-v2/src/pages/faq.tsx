import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';
import Faqs from 'containers/faqs';

const FAQPage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>FAQ - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
        </Head>

        <Faqs />
      </>
    </ApplicationLayout>
  );
};

export default FAQPage;
