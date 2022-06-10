import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

const About: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>About - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>
        About
      </>
    </ApplicationLayout>
  );
};

export default About;
