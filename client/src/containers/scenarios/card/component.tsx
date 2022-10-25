import { useState, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/outline';
import { Popover } from '@headlessui/react';

import { useDeleteScenario } from 'hooks/scenarios';
import { useScenarioInterventions } from 'hooks/interventions';
import Loading from 'components/loading';
import { Anchor, Button } from 'components/button';
import DeleteDialog from 'components/dialogs/delete';

import type { Scenario } from '../types';

type ScenarioCardProps = {
  data: Scenario;
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ data }) => {
  const [isDeleteVisible, setDeleteVisibility] = useState(false);
  const deleteScenario = useDeleteScenario();
  const { data: interventions, isLoading: isInterventionsLoading } = useScenarioInterventions({
    scenarioId: data?.id,
  });

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
        className="flex flex-col p-6 space-y-6 bg-white rounded-md shadow-sm"
        data-testid="scenario-card"
      >
        <div className="text-xs leading-4 text-gray-400">
          Modified: {format(new Date(data.updatedAt), 'yyyy/MM/dd')}
        </div>
        <div>
          <h2 className="text-lg" data-testid="scenario-title">
            {data.title}
          </h2>
          {data.description && (
            <p className="mt-4 text-xs leading-5 text-gray-500">{data.description}</p>
          )}
        </div>
        {/* TO-DO: Fix growth rate of 1.5% meanwhile is implemented in the API */}
        <div>
          <h3 className="text-xs">Growth rates</h3>
          <div className="flex mt-2 space-x-4">
            <div className="rounded-full bg-blue-400 py-0.5 px-3 text-xs">
              Entire company +1.5%/yr
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xs">Interventions</h3>
          {isInterventionsLoading && <Loading />}
          {!isInterventionsLoading && interventions && (
            <div>
              <div className="flex flex-wrap">
                {interventions.slice(0, 2).map((intervention) => (
                  <div
                    data-testid="scenario-interventions-item"
                    key={intervention.id}
                    className="mr-2 mb-2 rounded-full bg-orange-50 py-0.5 px-3 text-xs"
                  >
                    {intervention.title}
                  </div>
                ))}
              </div>
              {interventions.length > 2 && (
                <Popover className="relative text-xs">
                  Show{' '}
                  <Popover.Button className="mr-2 mb-2 rounded-full bg-orange-50 py-0.5 px-3 text-xs">
                    +{interventions.length - 2} more
                  </Popover.Button>
                  <Popover.Panel className="absolute p-4 bg-white border border-gray-100 rounded-md shadow-md">
                    {interventions.slice(2, interventions.length).map((intervention) => (
                      <div
                        key={intervention.id}
                        className="mr-2 mb-2 last:mb-0 rounded-full bg-orange-50 py-0.5 px-3 text-xs"
                      >
                        {intervention.title}
                      </div>
                    ))}
                  </Popover.Panel>
                </Popover>
              )}
            </div>
          )}
          {!isInterventionsLoading && interventions.length === 0 && (
            <p className="text-xs">No interventions created for this scenario.</p>
          )}
        </div>
        <div className="flex space-between">
          <Button
            variant="white"
            onClick={handleDeleteClick}
            icon={<TrashIcon />}
            data-testid="scenario-delete-btn"
          >
            Delete
          </Button>
          <div className="flex items-center justify-end flex-1 gap-4">
            <div className="text-xs leading-4 text-right text-gray-400">
              Modified:
              <br /> {format(new Date(data.updatedAt), 'yyyy/MM/dd')}
            </div>
            <Link href={`/data/scenarios/${data.id}/edit`} passHref>
              <Anchor variant="secondary">Edit Scenario</Anchor>
            </Link>
            <Link href={{ pathname: `/analysis/table`, query: { scenarioId: data.id } }} passHref>
              <Anchor variant="primary">Analyze</Anchor>
            </Link>
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
