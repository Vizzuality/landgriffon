import Head from 'next/head';

import ApplicationLayout from 'layouts/application';

import Compliance from 'containers/compliance';

import type { NextPage } from 'next';

type PageProps = { domain: string | null };

const CompliancePage: NextPage<PageProps> = () => {
  return (
    <ApplicationLayout>
      <>
        <Head>
          {/* To - DO - check the specific title for compliance page */}
          <title>EUDR and ESG Compliance with LandGriffon | LandGriffon</title>
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width" />
          <meta
            name="description"
            content="Ensure EUDR compliance with LandGriffon. Our tool, built with Vizzuality and CARTO, leverages BigQuery and Google Earth Engine for accurate deforestation assessments. Align with ESRS, TNFD, SBTN, and other sustainability standards using transparent, repeatable, and auditable analyses."
          />

          <meta name="og:title" content="EUDR and ESG Compliance with LandGriffon" />

          <meta
            name="og:description"
            content="Ensure EUDR compliance with LandGriffon. Our tool, built with Vizzuality and CARTO, leverages BigQuery and Google Earth Engine for accurate deforestation assessments. Align with ESRS, TNFD, SBTN, and other sustainability standards using transparent, repeatable, and auditable analyses."
          />
          <meta name="og:type" content="website" />
          <meta name="og:url" content="https://landgriffon.com/methodology" />
          <meta name="og:image" content="https://landgriffon.com/images/og/OG-LandGriffon.png" />
        </Head>

        <Compliance />
      </>
    </ApplicationLayout>
  );
};

export default CompliancePage;
