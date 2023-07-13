import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Home from 'containers/home';

import type { GetServerSideProps, NextPage } from 'next';

type PageProps = { domain: string | null };

const HomePage: NextPage<PageProps> = ({ domain }) => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Sustainable Supply Chain Solutions | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
          <meta
            name="description"
            content="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts."
          />

          <meta name="og:title" content="Sustainable Supply Chain Solutions" />
          <meta
            name="og:description"
            content="LandGriffon helps companies strategize the sustainable transformation of their supply chains by using technology, data and scientific-based analysis to manage environmental impacts."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com" />
          <meta name="og:image" content={`${domain}/images/og/OG-LandGriffon.png`} />
        </Head>

        <Home />
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

export default HomePage;
