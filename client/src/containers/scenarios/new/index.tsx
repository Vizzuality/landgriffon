import { useMemo, useCallback } from 'react';

import cx from 'classnames';
import { useQuery } from 'react-query';
import { apiService } from 'services/api';

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

const interventions = [
  {
    id: 1,
    title: 'Replace 50% of Palm Oil with Soybean Oil (RFA-certified) by 2025',
  },
  {
    id: 2,
    title: 'Change supplier of Rubber for pep.a.1.001 to Namazie International in 2022',
  },
  {
    id: 3,
    title: 'Change production efficiency of Palm oil for pep.a1 in 2 regions by 2025',
  },
  {
    id: 4,
    title: 'Change production efficiency of Cocoa for pep.a1 in 2 regions by 2025',
  },
];

const ScenariosNewContainer: React.FC = () => {
  const response = useQuery('scenarioNew', () =>
    apiService
      .post('/scenarios', { title: 'Untitled' })
      .then(({ data: responseData }) => responseData.data),
  );

  if (response.isSuccess) {
    // router.replace({
    //   pathname: '/analysis/scenario',
    //   query: {
    //     new: response.data.id,
    //   },
    // });
  }
  const dispatch = useAppDispatch();
  const handleNewScenarioFeature = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  const { scenarioCurrentTab } = useAppSelector(analysis);
  const interventionsContent = useMemo(
    () => scenarioCurrentTab === 'interventions',
    [scenarioCurrentTab],
  );

  const handleTab = useCallback((step) => dispatch(setScenarioTab(step)), [dispatch]);

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
