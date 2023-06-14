import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import TheService from 'containers/the-service';

const TheServicePage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>How We Help You Transform Your Supply Chain | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />

          <meta
            name="description"
            content="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts.."
          />

          <meta
            name="og:title"
            content="Sustainable Supply Chain Solutions: Made Straightforward."
          />

          <meta
            name="og:description"
            content="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts."
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
