import { useCallback } from 'react';
import toast from 'react-hot-toast';
import Head from 'next/head';
import router from 'next/router';

import { useCreateScenario } from 'hooks/scenarios';
import CleanLayout from 'layouts/clean';
import BackLink from 'components/back-link';
import ScenarioForm from 'containers/scenarios/form';

import type { ScenarioFormData } from 'containers/scenarios/types';
import type { ErrorResponse } from 'types';

const CreateScenarioPage: React.FC = () => {
  const createScenario = useCreateScenario();
  const handleCreateScenario = useCallback(
    (scenarioFormData: ScenarioFormData) => {
      createScenario.mutate(scenarioFormData, {
        onSuccess: ({ data }) => {
          const { data: scenario } = data;
          const { id, title } = scenario;
          toast.success(`The scenario ${title} has been created, you will be redirected shortly.`);
          // adding some delay to make sure the user reads the success message
          setTimeout(() => {
            router.replace(`/data/scenarios/${id}/edit`);
          }, 3000);
        },
        onError: (error: ErrorResponse) => {
          const { errors } = error.response?.data;
          errors.forEach(({ meta }) => toast.error(meta.rawError.response.message));
        },
      });
    },
    [createScenario],
  );

  return (
    <CleanLayout>
      <Head>
        <title>Create new scenario | Landgriffon</title>
      </Head>
      <BackLink
        href="/data/scenarios"
        className="flex mb-6 xl:sticky xl:top-0"
        data-testid="scenario-back-button"
      >
        Back to scenarios
      </BackLink>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 col-start-3">
          <h1>New scenario</h1>
          <ScenarioForm isSubmitting={createScenario.isLoading} onSubmit={handleCreateScenario} />
        </div>
      </div>
    </CleanLayout>
  );
};

export default CreateScenarioPage;
