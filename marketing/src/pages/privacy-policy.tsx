import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import PrivacyPolicy from 'containers/privacy-policy';

import type { GetServerSideProps, NextPage } from 'next';

type PageProps = { domain: string | null };

const PrivacyPolicyPage: NextPage<PageProps> = ({ domain }) => {
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
            content="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/privacy-policy" />
          <meta name="og:image" content={`${domain}/images/og/OG-LandGriffon.png`} />
        </Head>

        <PrivacyPolicy />
      </>
    </ApplicationLayout>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { referer } = context.req.headers;
  const url = new URL(referer || '');
  return {
    props: { domain: `${url.protocol}//${url.host}` || null },
  };
};

export default PrivacyPolicyPage;
