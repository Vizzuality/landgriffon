import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';
import Faqs from 'containers/faqs';

const FAQPage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>FAQs - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />

          <meta
            name="description"
            content="Here are the frequently asked questions we receive at LandGriffon, from who we are to what we do and how we do it."
          />

          <meta name="og:title" content="Sustainable Supply Chain Solutions: FAQs" />

          <meta
            name="og:description"
            content="Here are the frequently asked questions we receive at LandGriffon, from who we are to what we do and how we do it."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/faq" />
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-FAQs.png" />
        </Head>

        <Faqs />
      </>
    </ApplicationLayout>
  );
};

export default FAQPage;
