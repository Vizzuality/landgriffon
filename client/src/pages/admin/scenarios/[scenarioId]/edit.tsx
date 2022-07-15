import { useCallback } from 'react';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

import { useScenario, useUpdateScenario } from 'hooks/scenarios';

import CleanLayout from 'layouts/clean';
import ScenarioForm from 'containers/scenarios/form';
import BackLink from 'components/back-link';
import Loading from 'components/loading';

import type { ErrorResponse } from 'types';

const UpdateScenarioPage: React.FC = () => {
  const { query } = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useScenario(query?.scenarioId as string);
  const updateScenario = useUpdateScenario();

  const handleCreateScenario = useCallback(
    (scenarioFormData) => {
      updateScenario.mutate(
        { id: data.id, data: scenarioFormData },
        {
          onSuccess: () => {
            toast.success('Your changes were successfully saved.');
            queryClient.invalidateQueries('scenariosList');
          },
          onError: (error: ErrorResponse) => {
            const { errors } = error.response?.data;
            errors.forEach(({ meta }) => toast.error(meta.rawError.response.message));
          },
        },
      );
    },
    [data?.id, queryClient, updateScenario],
  );

  return (
    <CleanLayout>
      <Head>
        <title>Edit scenario | Landgriffon</title>
      </Head>
      <Link href="/admin/scenarios" passHref>
        <BackLink className="mb-6 flex xl:absolute xl:top-[60px] xl:mb-0">
          Back to scenarios
        </BackLink>
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-start-3 col-span-8">
          <h1>Edit scenario</h1>
          {isLoading && <Loading />}
          {!isLoading && data && (
            <ScenarioForm
              isSubmitting={updateScenario.isLoading}
              scenario={data}
              onSubmit={handleCreateScenario}
            />
          )}
        </div>
      </div>
    </CleanLayout>
  );
};

export default UpdateScenarioPage;
