import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Contact from 'containers/contact';

const ContactPage: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Contact - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>

        <Contact />
      </>
    </ApplicationLayout>
  );
};

export default ContactPage;
