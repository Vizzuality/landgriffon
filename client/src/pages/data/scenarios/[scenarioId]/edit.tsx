import { useCallback } from 'react';
import classnames from 'classnames';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon, PlusIcon, DotsVerticalIcon } from '@heroicons/react/solid';

import InfoTooltip from 'components/info-tooltip';
import { useScenario, useUpdateScenario } from 'hooks/scenarios';
import {
  useScenarioInterventions,
  useUpdateIntervention,
  useDeleteIntervention,
} from 'hooks/interventions';
import CleanLayout from 'layouts/clean';
import ScenarioForm from 'containers/scenarios/form';
import { LocationStatus } from 'containers/interventions/enums';
import BackLink from 'components/back-link';
import Loading from 'components/loading';
import Select from 'components/select';
import { Anchor, Button } from 'components/button';
import Input from 'components/forms/input';
import Toggle from 'components/toggle';
import Dropdown from 'components/dropdown';

import type { ScenarioFormData } from 'containers/scenarios/types';
import type { ErrorResponse } from 'types';

const UpdateScenarioPage: React.FC = () => {
  const { query } = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useScenario(query?.scenarioId as string, { include: 'user' });
  const updateScenario = useUpdateScenario();
  const updateIntervention = useUpdateIntervention();
  const deleteIntervention = useDeleteIntervention();

  // Interventions
  const { data: interventions, isLoading: isInterventionsLoading } = useScenarioInterventions({
    scenarioId: data?.id,
  });

  const handleUpdateScenario = useCallback(
    (scenarioFormData: ScenarioFormData) => {
      updateScenario.mutate(
        { id: data.id, data: scenarioFormData },
        {
          onSuccess: () => {
            toast.success('Your changes were successfully saved.');
            queryClient.invalidateQueries(['scenariosList']);
            queryClient.invalidateQueries(['scenario', data.id]);
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

  const handleInterventionToggle = useCallback(
    (interventionId: string, isActive: boolean) =>
      updateIntervention.mutate(
        { id: interventionId, data: { status: isActive ? 'active' : 'inactive' } },
        {
          onSuccess: () => {
            toast.success('Intervention has been successfully updated.');
            queryClient.invalidateQueries(['scenarioInterventions']);
          },
          onError: (error: ErrorResponse) => {
            const { errors } = error.response?.data;
            errors.forEach(({ meta }) => toast.error(meta.rawError.response.message));
          },
        },
      ),
    [queryClient, updateIntervention],
  );

  const handleDeleteIntervention = useCallback(
    (interventionId) => {
      deleteIntervention.mutate(interventionId, {
        onSuccess: () => {
          toast.success('Intervention has been successfully deleted.');
          queryClient.invalidateQueries(['scenarioInterventions']);
        },
      });
    },
    [queryClient, deleteIntervention],
  );

  return (
    <CleanLayout>
      <Head>
        <title>Edit scenario | Landgriffon</title>
      </Head>
      <Link href="/data/scenarios" passHref>
        <BackLink className="flex mb-6 xl:sticky xl:top-0">Back to scenarios</BackLink>
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 col-start-3">
          <h1>Edit scenario</h1>
          {isLoading && <Loading />}
          {!isLoading && data && (
            <ScenarioForm
              isSubmitting={updateScenario.isLoading}
              scenario={data}
              onSubmit={handleUpdateScenario}
            >
              {/* TO-DO: Promote to a specific component */}
              <div>
                <div className="flex items-baseline mb-4 space-x-1">
                  <h2>Growth rates</h2>
                  <InfoTooltip
                    icon="outline"
                    info="Growth rates set your expectations of how  purchases of raw materials will change into the future. Add a new rule to get started."
                  />
                </div>
                <div className="grid grid-cols-8 gap-4">
                  <div className="col-span-4">
                    <label className="block mb-2 text-sm">Business unit</label>
                    <Select current={null} disabled options={[]} />
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-2 text-sm">Growth rate (linear)</label>
                    <Input name="growth-rate" placeholder="0 % per year" disabled />
                  </div>
                  <div className="flex items-end col-span-2">
                    <Button disabled variant="secondary" className="w-full h-[40px]">
                      Add growth rate
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-2 mt-4 mb-2 border border-gray-300 rounded-md">
                  <div className="flex items-center rounded-full bg-blue-400 py-0.5 px-3 text-sm">
                    Entire company +1.5%/y
                    <button type="button" disabled>
                      <XIcon className="w-3 h-3 ml-2" />
                    </button>
                  </div>
                </div>
                <p className="mx-2 text-xs">
                  Add as many as you want, more specific growth rates override less specific ones.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline space-x-1">
                    <h2 className="flex-1">Interventions</h2>
                    <InfoTooltip
                      icon="outline"
                      info="Each intervention is a specific change in sourcing. Create an intervention to get started."
                    />
                  </div>
                  {!isInterventionsLoading && interventions.length > 0 && (
                    <Link href={`/data/scenarios/${data.id}/interventions/new`} passHref>
                      <Anchor
                        variant="secondary"
                        className="text-gray-900"
                        icon={
                          <div
                            aria-hidden="true"
                            className="flex items-center justify-center w-5 h-5 rounded-full bg-navy-400"
                          >
                            <PlusIcon className="w-4 h-4 text-white" />
                          </div>
                        }
                      >
                        Add intervention
                      </Anchor>
                    </Link>
                  )}
                </div>
                {isInterventionsLoading && <Loading />}
                {!isInterventionsLoading && interventions.length > 0 && (
                  <div className="space-y-2">
                    {interventions.map((intervention) => (
                      <div
                        key={intervention.id}
                        className={classnames('flex items-center p-4 space-x-4 rounded-md', {
                          'bg-gray-100': intervention.status === LocationStatus.inactive,
                          'bg-orange-50': intervention.status === LocationStatus.active,
                        })}
                      >
                        <div className="flex flex-1 space-x-2">
                          <Toggle
                            data-interventionId={intervention.id}
                            active={intervention.status === LocationStatus.active}
                            onChange={(isActive) =>
                              handleInterventionToggle(intervention.id, isActive)
                            }
                          />
                          <div>{intervention.title}</div>
                        </div>
                        <Dropdown>
                          <Dropdown.Button>
                            <DotsVerticalIcon className="w-4 h-4" />
                          </Dropdown.Button>
                          <Dropdown.Items>
                            <Dropdown.Item>
                              <Link
                                href={`/data/scenarios/${data.id}/interventions/${intervention.id}/edit`}
                              >
                                <a className="block px-3 py-2 text-sm">Edit</a>
                              </Link>
                              <button
                                type="button"
                                className="block px-3 py-2 text-sm"
                                onClick={() => handleDeleteIntervention(intervention.id)}
                              >
                                Delete
                              </button>
                            </Dropdown.Item>
                          </Dropdown.Items>
                        </Dropdown>
                      </div>
                    ))}
                  </div>
                )}
                {!isInterventionsLoading && interventions.length === 0 && (
                  <div className="px-10 py-16 space-y-6 text-center bg-gray-100 rounded-md">
                    <p className="text-sm">
                      Each scenario should be formed by at least one intervention in your supply
                      chain.
                    </p>
                    <Link href={`/data/scenarios/${data.id}/interventions/new`} passHref>
                      <Anchor
                        variant="secondary"
                        className="text-gray-900"
                        icon={
                          <div
                            aria-hidden="true"
                            className="flex items-center justify-center w-5 h-5 rounded-full bg-navy-400"
                          >
                            <PlusIcon className="w-4 h-4 text-white" />
                          </div>
                        }
                      >
                        Add intervention
                      </Anchor>
                    </Link>
                  </div>
                )}
              </div>
            </ScenarioForm>
          )}
        </div>
      </div>
    </CleanLayout>
  );
};

export default UpdateScenarioPage;
