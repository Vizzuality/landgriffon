import { useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { useCreateNewIntervention } from 'hooks/interventions';

import CleanLayout from 'layouts/clean';
import InterventionForm from 'containers/interventions/form';
import { parseInterventionFormDataToDto } from 'containers/interventions/utils';
import BackLink from 'components/back-link';

import type { ErrorResponse } from 'types';
import type { InterventionFormData } from 'containers/interventions/types';

const CreateInterventionPage: React.FC = () => {
  const { query } = useRouter();
  const createIntervention = useCreateNewIntervention();

  const handleSubmit = useCallback(
    (interventionFormData: InterventionFormData) => {
      const interventionDto = parseInterventionFormDataToDto(interventionFormData);

      createIntervention.mutate(interventionDto, {
        onSuccess: () => {
          toast.success(`Intervention was created successfully`);
          // adding some delay to make sure the user reads the success message
          setTimeout(() => {
            router.replace(`/data/scenarios/${interventionDto.scenarioId}/edit`);
          }, 1000);
        },
        onError: (error: ErrorResponse) => {
          const { errors } = error.response?.data;
          errors.forEach(({ meta }) => toast.error(meta.rawError.response.message));
        },
      });
    },
    [createIntervention],
  );

  return (
    <CleanLayout>
      <Head>
        <title>Create intervention for scenario | Landgriffon</title>
      </Head>
      <Link href={`/data/scenarios/${query.scenarioId}/edit`} passHref>
        <BackLink className="flex mb-6 xl:sticky xl:top-0">Back to scenario</BackLink>
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-10 col-start-2 xl:col-start-3 xl:col-span-8">
          <h1 data-testid="page-title">New intervention</h1>
          <InterventionForm onSubmit={handleSubmit} isSubmitting={createIntervention.isLoading} />
        </div>
      </div>
    </CleanLayout>
  );
};

export default CreateInterventionPage;
