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
          <meta
            name="description"
            content="LandGriffon uses a unique methodology and world-renowned datasets to analyze supply chain impacts."
          />

          <meta name="og:title" content="Sustainable Supply Chain Solutions: How It Works." />

          <meta
            name="og:description"
            content="LandGriffon uses a unique methodology and world-renowned datasets to analyze supply chain impacts."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/methodology" />
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-Methodology.png" />
        </Head>

        <Methodology />
      </>
    </ApplicationLayout>
  );
};

export default MethodologyPage;
