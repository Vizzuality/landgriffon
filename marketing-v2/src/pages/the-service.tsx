import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import TheService from 'containers/the-service';

const TheServicePage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>The Service | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />

          <meta
            name="description"
            content="LandGriffon uses six key steps to help you sustainably transform your supply chain."
          />

          <meta
            name="og:title"
            content="Sustainable Supply Chain Solutions: Made Straightforward."
          />

          <meta
            name="og:description"
            content="LandGriffon uses six key steps to help you sustainably transform your supply chain."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/the-service" />
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-The-Service.png" />
        </Head>

        <TheService />
      </>
    </ApplicationLayout>
  );
};

export default TheServicePage;
