import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Repository from 'containers/repository';

import type { NextPage } from 'next';

type PageProps = { domain: string | null };

const RepositoryPage: NextPage<PageProps> = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          <title>Knowledge Repository | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
          <meta
            name="description"
            content="At LandGriffon, we're dedicated to driving sustainability through science. Explore our repository for insights, methodologies, and datasets shaping our environmental impact assessment and resource management."
          />

          <meta name="og:title" content="Knowledge Repository | LandGriffon" />

          <meta
            name="og:description"
            content="At LandGriffon, we're dedicated to driving sustainability through science. Explore our repository for insights, methodologies, and datasets shaping our environmental impact assessment and resource management."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/repository" />
          {/* TO DO - Add image https://landgriffon.com/images/og/OG-Repository.png */}
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-LandGriffon.png" />
        </Head>

        <Repository />
      </>
    </ApplicationLayout>
  );
};

export default RepositoryPage;
