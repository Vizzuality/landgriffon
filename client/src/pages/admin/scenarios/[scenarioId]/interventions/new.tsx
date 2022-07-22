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

const CreateInterventionPage: React.FC = () => {
  const { query } = useRouter();
  const createIntervention = useCreateNewIntervention();

  const handleSubmit = useCallback(
    (interventionFormData) => {
      console.log('intervention form data: ', interventionFormData);
      const interventionDto = parseInterventionFormDataToDto(interventionFormData);
      console.log('intervention dto: ', interventionDto);
      createIntervention.mutate(interventionDto, {
        onSuccess: () => {
          toast.success(`Intervention was created successfully`);
          // adding some delay to make sure the user reads the success message
          setTimeout(() => {
            router.replace(`/admin/scenarios/${interventionDto.scenarioId}/edit`);
          }, 1000);
        },
        onError: (error: ErrorResponse) => {
          const { errors } = error.response?.data;
          errors.forEach(({ title }) => toast.error(title));
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
      <Link href={`/admin/scenarios/${query.scenarioId}/edit`} passHref>
        <BackLink className="mb-6 flex xl:sticky xl:top-0">Back to scenario</BackLink>
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-start-2 col-span-10 xl:col-start-3 xl:col-span-8">
          <h1>New intervention</h1>
          <InterventionForm onSubmit={handleSubmit} />
        </div>
      </div>
    </CleanLayout>
  );
};

export default CreateInterventionPage;
