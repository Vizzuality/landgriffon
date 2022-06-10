import { FC } from 'react';

import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

const Team: FC = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Team - Landgriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=1024" />
        </Head>
        Team
      </>
    </ApplicationLayout>
  );
};

export default Team;
