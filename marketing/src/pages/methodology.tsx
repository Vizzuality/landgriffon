import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Methodology from 'containers/methodology';

import type { GetServerSideProps, NextPage } from 'next';

type PageProps = { domain: string | null };

const MethodologyPage: NextPage<PageProps> = ({ domain }) => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>How We Analyze Supply Chain Impacts For Sustainabilty | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
          <meta
            name="description"
            content="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts.."
          />

          <meta name="og:title" content="Sustainable Supply Chain Solutions: How It Works." />

          <meta
            name="og:description"
            content="LandGriffon uses a unique methodology and world-renowned datasets to analyze supply chain impacts. Our open-source and open-science software ensures total transparency to align companies with nature standards and ESG regulations, such as SBTN and TNFD guidance."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/methodology" />
          <meta name="og:image" content={`${domain}/images/og/OG-Methodology.png`} />
        </Head>

        <Methodology />
      </>
    </ApplicationLayout>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const { host } = context.req.headers;
  const url = new URL(host);
  const protocol = url.protocol === 'localhost:' ? 'http:' : 'https:';
  return {
    props: { domain: `${protocol}//${url.href}` },
  };
};

export default MethodologyPage;
