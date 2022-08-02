import { useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { useDeleteScenario } from 'hooks/scenarios';
import { useScenarioInterventions } from 'hooks/interventions';

import InterventionPhrase from 'containers/interventions/phrase';
import Loading from 'components/loading';
import { AnchorLink, Button } from 'components/button';

import type { Scenario } from '../types';

type ScenarioCardProps = {
  data: Scenario;
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ data }) => {
  const deleteScenario = useDeleteScenario();
  const { data: interventions, isLoading: isInterventionsLoading } = useScenarioInterventions({
    scenarioId: data?.id,
  });

  const handleDeleteScenario = useCallback(() => {
    deleteScenario.mutate(data.id, {
      onSuccess: () => {
        toast.success(`Scenario deleted successfully`);
      },
    });
  }, [data?.id, deleteScenario]);

  return (
    <div className="rounded-md bg-white p-6 space-y-6 shadow-sm" data-testid="scenario-card">
      <h2 className="text-lg">{data.title}</h2>
      {data.description && <p className="text-gray-500 text-xs leading-5">{data.description}</p>}
      {/* TO-DO: Fix growth rate of 1.5% meanwhile is implemented in the API */}
      <div>
        <h3 className="text-xs">Growth rates</h3>
        <div className="flex space-x-4 mt-2">
          <div className="rounded-full bg-blue py-0.5 px-3 text-xs">Entire company +1.5%/yr</div>
        </div>
      </div>
      <div>
        <h3 className="text-xs">Interventions</h3>
        {isInterventionsLoading && <Loading />}
        {!isInterventionsLoading &&
          interventions &&
          interventions.map((intervention) => (
            <div
              className="flex space-x-4 mt-2"
              key={intervention.id}
              data-testid="scenario-interventions-item"
            >
              <div className="rounded-full bg-yellow py-0.5 px-3 text-xs">
                <InterventionPhrase intervention={intervention} short />
              </div>
            </div>
          ))}
        {!isInterventionsLoading && interventions.length === 0 && (
          <p className="text-xs">No interventions created for this scenario.</p>
        )}
      </div>
      <div className="flex space-between">
        <Button theme="secondary" onClick={handleDeleteScenario}>
          Delete
        </Button>
        <div className="flex flex-1 justify-end items-center gap-4">
          <div className="text-xs text-right text-gray-400 leading-4">
            Modified:
            <br /> {format(new Date(data.updatedAt), 'yyyy/MM/dd')}
          </div>
          <Link href={`/admin/scenarios/${data.id}/edit`} passHref>
            <AnchorLink theme="secondary">Edit</AnchorLink>
          </Link>
          <Link href={`/analysis?mode=table&scenarioId=${data.id}`} passHref>
            <AnchorLink theme="primary">Analyze</AnchorLink>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
