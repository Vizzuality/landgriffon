import { useCallback } from 'react';

import cx from 'classnames';
import { useQuery } from 'react-query';
import { apiService } from 'services/api';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';

import { setSubContentCollapsed } from 'store/features/analysis/ui';
import {
  scenarios,
  setNewInterventionData,
  setScenarioTab,
} from 'store/features/analysis/scenarios';

import { useInterventions } from 'hooks/interventions';

import Button from 'components/button';
import InterventionsList from 'containers/interventions/list';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';
import GrowthList from 'containers/growth/list/component';
import { PlusIcon } from '@heroicons/react/solid';
import { useCreateScenario } from 'hooks/scenarios';

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
  const dispatch = useAppDispatch();
  const { scenarioCurrentTab } = useAppSelector(scenarios);

  const response = useQuery('scenarioNew', () =>
    apiService.post('/scenarios', { title: 'Untitled' }).then(({ data: responseData }) => {
      if (responseData) {
        const {
          data: { id: scenarioId },
        } = responseData;
        dispatch(setNewInterventionData({ scenarioId }));
      }
      return responseData.data;
    }),
  );

  if (response.isSuccess) {
    // router.replace({
    //   pathname: '/analysis/scenario',
    //   query: {
    //     new: response.data.id,
    //   },
    // });
  }

  const { query } = useRouter();
  const { data: interventions } = useInterventions({ sort: query.sortBy as string });

  const createScenario = useCreateScenario();

  const handleNewScenarioFeature = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  const handleTab = useCallback((step) => dispatch(setScenarioTab(step)), [dispatch]);

  const handleSave = useCallback(() => {
    createScenario.mutate(
      { title: 'Untitled' },
      {
        onSuccess: (response) => {
          const {
            data: { id: scenarioId },
          } = response;
          scenarioId && dispatch(setNewInterventionData(scenarioId));
        },
        onError: (error, variables, context) => {
          console.log('error', error, variables, context);
        },
      },
    );
  }, []);

  return (
    <>
      <form action="#" method="POST" className="z-20">
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Untitled"
          aria-label="Scenario title"
          autoFocus
          className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-400 p-0 font-semibold mb-6"
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
                    'border-b-2 border-green-700': scenarioCurrentTab == 'interventions',
                  })}
                  onClick={() => handleTab('interventions')}
                >
                  Interventions ({interventions.length})
                </button>

                <button
                  type="button"
                  className={cx({ 'border-b-2 border-green-700': scenarioCurrentTab == 'growth' })}
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
          {scenarioCurrentTab == 'interventions' && <InterventionsList items={interventions} />}
          {scenarioCurrentTab == 'growth' && <GrowthList items={items} />}
        </div>
        <Button
          className="absolute bottom-6 font-medium text-base px-6 py-3 w-full"
          onClick={handleSave}
        >
          Save scenario
        </Button>
      </div>
    </>
  );
};

export default ScenariosNewContainer;
