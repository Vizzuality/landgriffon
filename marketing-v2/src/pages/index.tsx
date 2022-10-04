import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Home from 'containers/home';

const HomePage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Sustainable Supply Chain Solutions | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
          <meta
            name="description"
            content="LandGriffon empowers companies to measure, manage, and transform agricultural supply chain impacts."
          />

          <meta name="og:title" content="Sustainable Supply Chain Solutions" />
          <meta
            name="og:description"
            content="LandGriffon empowers companies to measure, manage, and transform agricultural supply chain impacts."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com" />
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-Home.png" />
        </Head>

        <Home />
      </>
    </ApplicationLayout>
  );
};

export default HomePage;
