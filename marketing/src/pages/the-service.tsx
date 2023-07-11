import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import TheService from 'containers/the-service';

import type { GetServerSideProps, NextPage } from 'next';

type PageProps = { domain: string | null };

const TheServicePage: NextPage<PageProps> = ({ domain }) => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>How We Help You Transform Your Supply Chain | LandGriffon Service</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />

          <meta
            name="description"
            content="Transform your supply chain sustainably with our advanced technology-driven service. LandGriffon leverages data and scientific analysis to empower companies in strategizing their environmental impact management, driving sustainable practices for a greener future."
          />

          <meta
            name="og:title"
            content="Sustainable Supply Chain Solutions: Made Straightforward."
          />

          <meta
            name="og:description"
            content="Transform your supply chain sustainably with our advanced technology-driven service. LandGriffon leverages data and scientific analysis to empower companies in strategizing their environmental impact management, driving sustainable practices for a greener future."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/the-service" />
          <meta name="og:image" content={`${domain}/images/og/OG-The-Service.png`} />
        </Head>

        <TheService />
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

export default TheServicePage;
