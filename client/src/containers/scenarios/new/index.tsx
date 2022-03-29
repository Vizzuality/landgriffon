import { useCallback, useState, useEffect } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';

import cx from 'classnames';
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
// import { useCreateScenario } from 'hooks/scenarios';

// form validator
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { isEmpty } from 'lodash';

import { useCreateScenario, useUpdateScenario } from 'hooks/scenarios';

import type { ErrorResponse } from 'types';

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

const schemaValidation = yup.object({
  title: yup.string().min(2).required(),
  description: yup.string(),
});

const ScenariosNewContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { scenarioCurrentTab } = useAppSelector(scenarios);

  const [scenarioId, setScenarioId] = useState(null);
  const [scenarioData, setScenarioData] = useState({
    title: 'Untitled',
    description: '',
  });

  const { query } = useRouter();
  const { data: interventions } = useInterventions({ sort: query.sortBy as string });

  const handleNewScenarioFeature = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  const handleTab = useCallback((step) => dispatch(setScenarioTab(step)), [dispatch]);

  const {
    register,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const updateScenario = useUpdateScenario();
  const createScenario = useCreateScenario();

  useEffect(() => {
    if (!scenarioId && !isEmpty(scenarioData)) {
      createScenario.mutate(
        { ...scenarioData },
        {
          onSuccess: ({ data }) => {
            const {
              data: { id: scenarioId },
            } = data;
            setScenarioId(scenarioId);
            scenarioId && dispatch(setNewInterventionData(scenarioId));
          },
          onError: (error: ErrorResponse) => {
            const { errors } = error.response?.data;
            errors.forEach(({ title }) => toast.error(title));
          },
        },
      );
    }
  }, [scenarioId]);

  const handleChange = useDebounceCallback(
    useCallback(
      (id: string, values: unknown) => {
        setScenarioData({ ...scenarioData, [id]: values });
        if (scenarioId && isValid) {
          updateScenario.mutate(
            { id: scenarioId, data: scenarioData },
            {
              onSuccess: () => {
                toast.success('Your changes were successfully saved.');
              },
              onError: (error: ErrorResponse) => {
                const { errors } = error.response?.data;
                errors.forEach(({ title }) => toast.error(title));
              },
            },
          );
        }
      },
      [scenarioId, isValid, scenarioData, updateScenario],
    ),
    600,
  );

  return (
    <>
      <form action="#" method="POST" className="z-20">
        <input
          {...register('title')}
          type="text"
          name="title"
          id="title"
          defaultValue="Untitled"
          placeholder="Untitled"
          aria-label="Scenario title"
          autoFocus
          className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-400 p-0 font-semibold mb-6"
          onInput={(e) => handleChange('title', e.currentTarget.value)}
        />

        <div className="sm:col-span-6">
          <Label htmlFor="description">
            Scenario description <span className="text-gray-500">(optional)</span>
          </Label>
          <Textarea
            {...register('description')}
            id="description"
            name="description"
            rows={3}
            className="w-full"
            defaultValue=""
            onChange={(e) => handleChange('description', e.currentTarget.value)}
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
        {/* <Button
          className="absolute bottom-6 font-medium text-base px-6 py-3 w-full"
          onClick={handleSave}
        >
          Save scenario
        </Button> */}
      </div>
    </>
  );
};

export default ScenariosNewContainer;
