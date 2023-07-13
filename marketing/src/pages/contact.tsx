import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Contact from 'containers/contact';
import type { GetServerSideProps, NextPage } from 'next';

type PageProps = { domain: string | null };

const ContactPage: NextPage<PageProps> = ({ domain }) => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Sustainable Supply Chain Solutions: Contact Us! | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />

          <meta
            name="description"
            content="Interested in how LandGriffon services could support your company along its sustainability journey? We would love to hear from you."
          />

          <meta name="og:title" content="Sustainable Supply Chain Solutions: Contact Us!" />

          <meta
            name="og:description"
            content="Interested in how LandGriffon services could support your company along its sustainability journey? We would love to hear from you."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/contact" />
          <meta name="og:image" content={`${domain}/images/og/OG-LandGriffon.png`} />
        </Head>

        <Contact />
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

export default ContactPage;
