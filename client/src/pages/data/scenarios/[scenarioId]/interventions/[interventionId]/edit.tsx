import { useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { useIntervention, useUpdateIntervention } from 'hooks/interventions';
import { parseInterventionFormDataToDto } from 'containers/interventions/utils';
import CleanLayout from 'layouts/clean';
import InterventionForm from 'containers/interventions/form';
import BackLink from 'components/back-link/component';
import Loading from 'components/loading';

import type { InterventionFormData } from 'containers/interventions/types';
import type { ErrorResponse } from 'types';

const EditInterventionPage: React.FC = () => {
  const router = useRouter();
  const { query } = router;
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
        'newT1Supplier',
        'newProducer',
      ].join(','),
    },
    options: {
      placeholderData: null,
    },
  });
  const editIntervention = useUpdateIntervention();

  const handleSubmit = useCallback(
    (interventionFormData: InterventionFormData) => {
      const interventionDto = parseInterventionFormDataToDto(interventionFormData);
      editIntervention.mutate(
        { id: data.id, data: interventionDto },
        {
          onSuccess: () => {
            toast.success(`Intervention edited successfully`);
            // adding some delay to make sure the user reads the success message
            setTimeout(() => {
              router.replace(`/data/scenarios/${interventionDto.scenarioId}/edit`);
            }, 2000);
          },
          onError: (error: ErrorResponse) => {
            const { errors } = error.response?.data;
            errors.forEach(({ title }) => toast.error(title));
          },
        },
      );
    },
    [editIntervention, router, data],
  );

  return (
    <CleanLayout>
      <Head>
        <title>Edit of an intervention | Landgriffon</title>
      </Head>
      <BackLink
        href={`/data/scenarios/${query.scenarioId}/edit`}
        className="flex mb-6 xl:sticky xl:top-0"
      >
        Back to scenario
      </BackLink>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-10 col-start-2 xl:col-start-3 xl:col-span-8">
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
