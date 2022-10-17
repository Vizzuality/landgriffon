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

import type { InterventionFormData } from 'containers/interventions/types';

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
    onError: (error) => {
      const { errors } = error.response?.data;
      errors.forEach(({ meta }) => {
        const message = meta.rawError.response.message;
        if (Array.isArray(message)) {
          toast.error(message.join('. '));
        } else {
          toast.error(message);
        }
      });
    },
  });

  const handleSubmit = useCallback(
    (interventionFormData: InterventionFormData) => {
      const interventionDto = parseInterventionFormDataToDto(interventionFormData);
      createIntervention.mutate(interventionDto);
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
