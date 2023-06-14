import { FC } from 'react';

import Head from 'next/head';

import About from 'containers/about';

import ApplicationLayout from 'layouts/application';

const AboutPage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>
            The Mission? Sustainable Supply Chains. This Is How We Get There | LandGriffon
          </title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
          <meta
            name="description"
            content="We urgently need to move towards a zero-carbon and nature positive future. We help companies evolve at the speed and scale needed for this, through technology, data, and advice on how to manage supply chain impacts."
          />

          <meta
            name="og:title"
            content="Sustainable Supply Chain Solutions: More Than A Buzzword."
          />

          <meta
            name="og:description"
            content="We urgently need to move towards a zero-carbon and nature-positive future. We help companies evolve at the speed and scale needed for this, through technology, data, and advice on how to manage supply chain impacts."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/about" />
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-LandGriffon.png" />
        </Head>

        <About />
      </>
    </ApplicationLayout>
  );
};

export default AboutPage;
