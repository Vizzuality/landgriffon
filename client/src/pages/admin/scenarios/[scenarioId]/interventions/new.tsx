import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import CleanLayout from 'layouts/clean';
import BackLink from 'components/back-link';

const CreateInterventionPage: React.FC = () => {
  const { query } = useRouter();

  return (
    <CleanLayout>
      <Head>
        <title>Create intervention for scenario | Landgriffon</title>
      </Head>
      <Link href={`/admin/scenarios/${query.scenarioId}/edit`} passHref>
        <BackLink className="mb-6 flex xl:absolute xl:top-[60px] xl:mb-0">
          Back to scenario
        </BackLink>
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-start-3 col-span-8">
          <h1>New intervention</h1>
        </div>
      </div>
    </CleanLayout>
  );
};

export default CreateInterventionPage;
