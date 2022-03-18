import { useCallback, useEffect } from 'react';
import { useDebounce } from '@react-hook/debounce';

import cx from 'classnames';
import { useRouter } from 'next/router';
import { useScenario, useUpdateScenario } from 'hooks/scenarios';
import { useInterventions } from 'hooks/interventions';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis/ui';
import { setScenarioTab, scenarios } from 'store/features/analysis/scenarios';

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

  const { scenarioCurrentTab, currentScenario } = useAppSelector(scenarios);

  const { data, isLoading, error } = useScenario(currentScenario as string, { sort: 'title' });

  const { data: interventions } = useInterventions({ sort: query.sortBy as string });
  const [scenarioNewData, setScenarioNewData] = useDebounce(data, 500);

  const updateScenario = useUpdateScenario();

  const handleUpdateScenario = useCallback(() => {
    if (!!scenarioNewData.title || !!scenarioNewData.description)
      updateScenario.mutate({ id: data.id, data: scenarioNewData });
  }, [updateScenario, data, scenarioNewData]);

  useEffect(() => {
    if (!isLoading && !error && scenarioNewData !== data) {
      setScenarioNewData(data);
      handleUpdateScenario();
    }
  }, [scenarioNewData, data]);

  const dispatch = useAppDispatch();
  const handleNewScenarioFeature = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  const handleTab = useCallback((step) => dispatch(setScenarioTab(step)), [dispatch]);

  const handleOnKeyDown = useCallback(
    (id, e) => {
      if (e.keyCode === 46 || e.keyCode === 8) {
        const data =
          id === 'title'
            ? { ...scenarioNewData, title: 'Untitled' }
            : { ...scenarioNewData, description: '  ' };
        setScenarioNewData(data);
        updateScenario.mutate({ id: data.id, data });
      }
    },
    [data.id, scenarioNewData],
  );

  return (
    <>
      <form className="z-20">
        <input
          type="text"
          name="title"
          id="title"
          placeholder={scenarioNewData.title}
          aria-label="Scenario title"
          className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-900 p-0 mb-6"
          onChange={(e) =>
            e.currentTarget.value.length > 2 &&
            setScenarioNewData({ ...scenarioNewData, title: e.currentTarget.value })
          }
          onKeyDown={(e) => e.currentTarget.value.length === 0 && handleOnKeyDown('title', e)}
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
            placeholder={scenarioNewData.description}
            defaultValue=""
            onChange={(e) =>
              e.currentTarget.value.length > 2 &&
              setScenarioNewData({ ...scenarioNewData, description: e.currentTarget.value })
            }
            onKeyDown={(e) =>
              e.currentTarget.value.length === 0 && handleOnKeyDown('description', e)
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
                  className={cx({
                    'border-b-2 border-green-700': scenarioCurrentTab === 'interventions',
                  })}
                  onClick={() => handleTab('interventions')}
                >
                  Interventions ({interventions.length})
                </button>

                <button
                  type="button"
                  className={cx({ 'border-b-2 border-green-700': scenarioCurrentTab === 'growth' })}
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
          {scenarioCurrentTab === 'growth' && <InterventionsList items={interventions} />}
          {scenarioCurrentTab === 'interventions' && <GrowthList items={items} />}
        </div>
      </div>
    </>
  );
};

export default ScenariosNewContainer;
