import { useCallback } from 'react';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useScenario, useUpdateScenario } from 'hooks/scenarios';

import CleanLayout from 'layouts/clean';
import BackLink from 'components/back-link';
import ScenarioForm from 'containers/scenarios/form';

import type { ErrorResponse } from 'types';

const UpdateScenarioPage: React.FC = () => {
  const { query } = useRouter();
  console.log(query.scenarioId);
  const { data } = useScenario(query?.scenarioId as string);
  console.log(data);
  const updateScenario = useUpdateScenario();
  const handleCreateScenario = useCallback(
    (scenarioFormData) => {
      console.log(scenarioFormData);
      // createScenario.mutate(scenarioFormData, {
      //   onSuccess: ({ data }) => {
      //     const { data: scenario } = data;
      //     const { id, title } = scenario;
      //     toast.success(`The scenario ${title} has been created`);
      //     // adding some delay to make sure the user reads the success message
      //     setTimeout(() => {
      //       router.replace(`/admin/scenarios/${id}/edit`);
      //     }, 1000);
      //   },
      //   onError: (error: ErrorResponse) => {
      //     const { errors } = error.response?.data;
      //     errors.forEach(({ title }) => toast.error(title));
      //   },
      // });
    },
    [updateScenario],
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
          <ScenarioForm onSubmit={handleCreateScenario} />
        </div>
      </div>
    </CleanLayout>
  );
};

export default UpdateScenarioPage;
