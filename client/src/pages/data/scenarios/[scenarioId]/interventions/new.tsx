import { useCallback } from 'react';
import Head from 'next/head';
import router, { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import omitBy from 'lodash-es/omitBy';

import { useCreateNewIntervention } from 'hooks/interventions';
import CleanLayout from 'layouts/clean';
import InterventionForm from 'containers/interventions/form';
import { parseInterventionFormDataToDto } from 'containers/interventions/utils';
import BackLink from 'components/back-link';
import { handleResponseError } from 'services/api';

import type { InterventionDto, InterventionFormData } from 'containers/interventions/types';

const CreateInterventionPage: React.FC = () => {
  const { query } = useRouter();
  const createIntervention = useCreateNewIntervention({
    onSuccess: (_data, variables) => {
      toast.success(`Intervention was created successfully`);
      // adding some delay to make sure the user reads the success message
      setTimeout(() => {
        router.replace(`/data/scenarios/${variables.scenarioId}/edit`);
      }, 1000);
    },
    onError: handleResponseError,
  });

  const handleSubmit = useCallback(
    (interventionFormData: InterventionFormData) => {
      const interventionDto = parseInterventionFormDataToDto(interventionFormData);
      // for the creation remove null or undefined values
      const interventionDtoCleaned = omitBy(
        interventionDto,
        (value) => value === null || value === undefined,
      );
      createIntervention.mutate(interventionDtoCleaned as InterventionDto);
    },
    [createIntervention],
  );

  return (
    <CleanLayout>
      <Head>
        <title>Create intervention for scenario | Landgriffon</title>
      </Head>
      <BackLink
        href={`/data/scenarios/${query.scenarioId}/edit`}
        className="flex mb-6 xl:sticky xl:top-0"
      >
        Back to scenario
      </BackLink>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-10 col-start-2 xl:col-start-3 xl:col-span-8">
          <h1 data-testid="page-title">New intervention</h1>
          <InterventionForm
            onSubmit={handleSubmit}
            isCreation
            isSubmitting={createIntervention.isLoading}
          />
        </div>
      </div>
    </CleanLayout>
  );
};

export default CreateInterventionPage;
