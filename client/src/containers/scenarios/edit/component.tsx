import { useMemo, useCallback, useState } from 'react';

import cx from 'classnames';
import { useRouter } from 'next/router';
import { useScenario, useUpdateScenario } from 'hooks/scenarios';
import { useInterventions } from 'hooks/interventions';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setScenarioTab, setSubContentCollapsed } from 'store/features/analysis';

import Button from 'components/button';
import InterventionsList from 'containers/interventions/list';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';
import GrowthList from 'containers/growth/list/component';
import { PlusIcon } from '@heroicons/react/solid';

const items = [
  {
    id: 1,
    title: 'Set growth rate for all materials to +2%/yr in 2020',
  },
  {
    id: 2,
    title: 'Set growth rate for all materials to +2%/yr in 2020',
  },
  {
    id: 3,
    title: 'Set growth rate for all materials to +2%/yr in 2020',
  },
];

const ScenariosNewContainer: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  const { scenarioCurrentTab, currentScenario } = useAppSelector(analysis);

  const { data, isLoading, error } = useScenario(currentScenario as string, { sort: 'title' });
  const { title } = !isLoading && !error && data;

  const { data: interventions } = useInterventions({ sort: query.sortBy as string });
  const [scenarioNewData, setScenarioNewData] = useState(data);

  const updateScenario = useUpdateScenario();

  const handleUpdateScenario = useCallback(() => {
    updateScenario.mutate(
      { id: data.id, data: scenarioNewData },
      {
        onSuccess: (data) => {
          console.log('onsucces', data);
        },
        onError: (error, variables, context) => {
          console.log('error', error, variables, context);
        },
      },
    );
  }, [updateScenario, data, scenarioNewData]);

  const dispatch = useAppDispatch();
  const handleNewScenarioFeature = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  const interventionsContent = useMemo(
    () => scenarioCurrentTab === 'interventions',
    [scenarioCurrentTab],
  );

  const handleTab = useCallback((step) => dispatch(setScenarioTab(step)), [dispatch]);

  return (
    <>
      <form onSubmit={handleUpdateScenario} className="z-20">
        <input
          type="text"
          name="title"
          id="title"
          placeholder={title}
          aria-label="Scenario title"
          className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-900 p-0 mb-6"
        />

        <div className="sm:col-span-6">
          <Label htmlFor="description">
            Scenario description <span className="text-gray-500">(optional)</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            className="w-full"
            defaultValue=""
            onChange={(e) =>
              setScenarioNewData({ ...scenarioNewData, description: e.currentTarget.value })
            }
          />
        </div>
      </form>
      <div className="h-full flex flex-col w-auto bg-white py-6 overflow-auto relative">
        <div className="relative">
          <div className="flex items-center content-between text-sm">
            <div className="pb-6 flex items-center justify-between w-full">
              <div className="space-x-2">
                <button
                  type="button"
                  className={cx({ 'border-b-2 border-green-700': interventionsContent })}
                  onClick={() => handleTab('interventions')}
                >
                  Interventions ({interventions.length})
                </button>

                <button
                  type="button"
                  className={cx({ 'border-b-2 border-green-700': !interventionsContent })}
                  onClick={() => handleTab('growth')}
                >
                  Growth rates ({items.length})
                </button>
              </div>
              <Button onClick={handleNewScenarioFeature}>
                <PlusIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
                New
              </Button>
            </div>
          </div>
          {interventionsContent && <InterventionsList items={interventions} />}
          {!interventionsContent && <GrowthList items={items} />}
        </div>
      </div>
    </>
  );
};

export default ScenariosNewContainer;
