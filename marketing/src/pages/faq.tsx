import Head from 'next/head';

import ApplicationLayout from 'layouts/application';
import Faqs from 'containers/faqs';

import type { GetServerSideProps, NextPage } from 'next';

type PageProps = { domain: string | null };

const FAQPage: NextPage<PageProps> = ({ domain }) => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Sustainable Supply Chain Solutions: FAQs | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />

          <meta
            name="description"
            content="Here are the frequently asked questions we receive at LandGriffon, from who we are to what we do and how we do it. We help companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts."
          />

          <meta name="og:title" content="Sustainable Supply Chain Solutions: FAQs" />

          <meta
            name="og:description"
            content="Here are the frequently asked questions we receive at LandGriffon, from who we are to what we do and how we do it. We help companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/faq" />
          <meta name="og:image" content={`${domain}/images/og/OG-LandGriffon.png`} />
        </Head>

        <Faqs />
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

export default FAQPage;
