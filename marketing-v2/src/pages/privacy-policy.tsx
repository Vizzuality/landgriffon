import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import PrivacyPolicy from 'containers/privacy-policy';

const PrivacyPolicyPage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Privacy Police | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />

          <meta
            name="description"
            content="On this page you will find the Privacy Policy, Cookie Policy, and Legal Notice that applies to the LandGriffon Consortium."
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
          <meta name="og:url" content="https://landgriffon.com/privacy-policy" />
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-FAQ.png" />
        </Head>

        <PrivacyPolicy />
      </>
    </ApplicationLayout>
  );
};

export default PrivacyPolicyPage;
