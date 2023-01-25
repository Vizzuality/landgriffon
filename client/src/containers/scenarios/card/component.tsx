import { useState, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/outline';
import { Popover } from '@headlessui/react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';

import { useDeleteScenario, useUpdateScenario } from 'hooks/scenarios';
import { useScenarioInterventions } from 'hooks/interventions';
import Loading from 'components/loading';
import { Anchor, Button, LinkAnchor } from 'components/button';
import DeleteDialog from 'components/dialogs/delete';
import Pill from 'components/pill';
import Toggle from 'components/toggle';
import { usePermissions } from 'hooks/permissions';
import { Permission } from 'hooks/permissions/enums';

import type { ErrorResponse } from 'types';
import type { ScenarioCardProps } from './types';

const ScenarioCard: React.FC<ScenarioCardProps> = ({ data, display = 'grid' }) => {
  const [isDeleteVisible, setDeleteVisibility] = useState(false);
  const queryClient = useQueryClient();
  const deleteScenario = useDeleteScenario();
  const updateScenario = useUpdateScenario();
  const { data: interventions, isLoading: isInterventionsLoading } = useScenarioInterventions({
    scenarioId: data?.id,
  });

  const { hasPermission } = usePermissions(data?.userId);
  const canEditScenario = hasPermission(Permission.CAN_EDIT_SCENARIO);
  const canDeleteScenario = hasPermission(Permission.CAN_DELETE_SCENARIO);

  const handleChangeVisibility = useCallback(
    (isActive) => {
      updateScenario.mutate(
        { id: data.id, data: { visibility: isActive ? 'public' : 'private' } },
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
    [data.id, updateScenario, queryClient],
  );

  const handleDeleteClick = useCallback(() => {
    setDeleteVisibility(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDeleteVisibility(false);
  }, []);

  const handleDeleteScenario = useCallback(() => {
    deleteScenario.mutate(data.id, {
      onSuccess: () => {
        setDeleteVisibility(false);
        toast.success(`Scenario deleted successfully`);
      },
    });
  }, [data?.id, deleteScenario]);

  return (
    <>
      <div
        className={classNames('bg-white rounded-md shadow-sm', {
          'w-full max-w-[1280px] xl:max-w-none overflow-auto': display === 'list',
        })}
        data-testid="scenario-card"
      >
        <div
          className={classNames('p-6', {
            'grid grid-cols-5 gap-4': display === 'list',
            'flex flex-col space-y-6 h-full': display === 'grid',
          })}
        >
          <div className="flex flex-col">
            <div
              className={classNames('text-xs leading-4 text-gray-400', {
                'order-last mt-1': display === 'list',
              })}
            >
              Modified: {format(new Date(data.updatedAt), 'yyyy/MM/dd')}
            </div>
            <h2 className="text-lg break-words" data-testid="scenario-title">
              {data.title}
            </h2>
            {data.description && display === 'grid' && (
              <p className="mt-2 text-xs leading-5 text-gray-500">{data.description}</p>
            )}
          </div>
          {/* TO-DO: Fix growth rate of 1.5% meanwhile is implemented in the API */}
          <div>
            {display === 'grid' && <h3 className="text-xs">Growth rates</h3>}
            <div
              className={classNames({
                'flex mt-2 space-x-4': display === 'grid',
              })}
            >
              <Pill className="bg-blue-200">Entire company +1.5%/yr</Pill>
            </div>
          </div>
          <div
            className={classNames({
              'flex-1': display === 'grid',
            })}
          >
            {display === 'grid' && <h3 className="mb-2 text-xs">Interventions</h3>}
            {isInterventionsLoading && <Loading />}
            {!isInterventionsLoading && interventions && (
              <>
                <div className="flex flex-wrap gap-2">
                  {interventions.slice(0, 2).map((intervention) => (
                    <Pill
                      key={intervention.id}
                      className="bg-orange-100"
                      data-testid="scenario-interventions-item"
                    >
                      {intervention.title}
                    </Pill>
                  ))}
                </div>
                {interventions.length > 2 && (
                  <Popover className="relative mt-2 text-xs">
                    Show{' '}
                    <Popover.Button>
                      <Pill className="bg-orange-100">+{interventions.length - 2} more</Pill>
                    </Popover.Button>
                    <Popover.Panel className="absolute flex flex-col p-4 space-y-2 bg-white border border-gray-100 rounded-md shadow-md">
                      {interventions.slice(2, interventions.length).map((intervention) => (
                        <Pill key={intervention.id} className="bg-orange-100">
                          {intervention.title}
                        </Pill>
                      ))}
                    </Popover.Panel>
                  </Popover>
                )}
              </>
            )}
            {!isInterventionsLoading && interventions.length === 0 && (
              <p className="text-xs">No interventions created for this scenario.</p>
            )}
          </div>
          <div
            className={classNames('flex items-center space-x-1', {
              'bg-navy-50': data.visibility === 'public',
              'bg-gray-100': data.visibility !== 'public',
              'rounded-md justify-center p-3': display === 'list',
              'p-6 -mx-6': display === 'grid',
            })}
          >
            <Toggle
              data-testid="scenario-visibility"
              // active={data.visibility === 'public'} // ! uncomment this line when the API returns the visibility of the scenario
              active
              onChange={handleChangeVisibility}
              disabled // ! <-- this feature is disabled until the API allows to change the visibility of a scenario
              // disabled={!canEditScenario}
            />
            <span className="text-sm text-gray-500 peer-disabled:text-gray-300">
              Make scenario public
            </span>
          </div>
          <div
            className={classNames({
              'flex space-between my-6': display === 'grid',
              'flex flex-col-reverse gap-2 ': display === 'list',
            })}
          >
            <Button
              variant="white"
              onClick={handleDeleteClick}
              icon={<TrashIcon />}
              data-testid="scenario-delete-btn"
              disabled={!canDeleteScenario}
            >
              Delete
            </Button>
            <div
              className={classNames('flex items-center flex-1 space-x-4', {
                'justify-between': display === 'list',
                'justify-end': display === 'grid',
              })}
            >
              <LinkAnchor
                href={`/data/scenarios/${data.id}/edit`}
                variant="secondary"
                className={classNames({
                  grow: display === 'list',
                })}
                disabled={!canEditScenario}
                data-testid="scenario-edit-btn"
              >
                Edit Scenario
              </LinkAnchor>
              <Link href={{ pathname: `/analysis/table`, query: { scenarioId: data.id } }} passHref>
                <Anchor
                  variant="primary"
                  className={classNames({
                    grow: display === 'list',
                  })}
                >
                  Analyze
                </Anchor>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <DeleteDialog
        isOpen={isDeleteVisible}
        title="Delete Scenario"
        onDelete={handleDeleteScenario}
        onClose={handleCloseDialog}
        description="All of this scenario data will be permanently removed from our servers forever. This action cannot be undone."
      />
    </>
  );
};

export default ScenarioCard;
