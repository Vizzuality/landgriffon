import { AnchorLink, Button } from 'components/button';
import Link from 'next/link';
import { format } from 'date-fns';

import { useScenarioIntervention } from 'hooks/interventions';

import Loading from 'components/loading';

import type { Scenario } from '../types';

type ScenarioCardProps = {
  data: Scenario;
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ data }) => {
  const { data: interventions, isLoading: isInterventionsLoading } = useScenarioIntervention({
    scenarioId: data.id,
  });

  return (
    <div className="rounded-md bg-white p-6 space-y-6 shadow-sm">
      <h2>{data.title}</h2>
      {data.description && <p className="text-gray-500 text-xs leading-5">{data.description}</p>}
      {/* TO-DO: Fix growth rate of 1.5% meanwhile is implemented in the API */}
      <div>
        <h3>Growth rates</h3>
        <div className="flex space-x-4 mt-2">
          <div className="rounded-full bg-blue py-0.5 px-3 text-xs">Entire company +1.5%/yr</div>
        </div>
      </div>
      <div>
        <h3>Interventions</h3>
        {isInterventionsLoading && <Loading />}
        {!isInterventionsLoading &&
          interventions &&
          interventions.map((intervention) => (
            <div className="flex space-x-4 mt-2" key={intervention.id}>
              <div className="rounded-full bg-yellow py-0.5 px-3 text-xs">{intervention.title}</div>
            </div>
          ))}
        {!isInterventionsLoading && interventions.length === 0 && (
          <p className="text-xs">No interventions created for this scenario.</p>
        )}
      </div>
      <div className="flex space-between">
        <Button theme="secondary">Delete</Button>
        <div className="flex flex-1 justify-end items-center gap-4">
          <div className="text-xs text-right leading-4">
            Modified:
            <br /> {format(new Date(data.updatedAt), 'yyyy/MM/dd')}
          </div>
          <Link href={`/admin/scenarios/${data.id}/edit`} passHref>
            <AnchorLink theme="secondary">Edit</AnchorLink>
          </Link>
          <Button theme="primary">Analyze</Button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
