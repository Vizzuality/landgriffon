import { useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useIntervention, useUpdateIntervention } from 'hooks/interventions';

import CleanLayout from 'layouts/clean';
import InterventionForm from 'containers/interventions/form';
import BackLink from 'components/back-link/component';
import Loading from 'components/loading';

const EditInterventionPage: React.FC = () => {
  const { query } = useRouter();
  const { data, isLoading } = useIntervention({
    interventionId: query?.interventionId as string,
    params: {
      include: [
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedSuppliers',
        'newMaterial',
        'newBusinessUnit',
        'newAdminRegion',
      ].join(','),
    },
  });
  console.log(data);
  const editIntervention = useUpdateIntervention();

  const handleSubmit = useCallback(() => {}, []);

  return (
    <CleanLayout>
      <Head>
        <title>Edit of a intervention | Landgriffon</title>
      </Head>
      <Link href={`/admin/scenarios/${query.scenarioId}/edit`} passHref>
        <BackLink className="mb-6 flex xl:sticky xl:top-0">Back to scenario</BackLink>
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-start-2 col-span-10 xl:col-start-3 xl:col-span-8">
          <h1 data-testid="page-title">Edit intervention</h1>
          {isLoading && <Loading />}
          {!isLoading && data && (
            <InterventionForm
              intervention={data}
              onSubmit={handleSubmit}
              isSubmitting={editIntervention.isLoading}
            />
          )}
        </div>
      </div>
    </CleanLayout>
  );
};

export default EditInterventionPage;
