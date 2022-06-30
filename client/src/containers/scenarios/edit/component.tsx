import { useCallback, useState } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import cx from 'classnames';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useScenario, useUpdateScenario, useScenarioInterventions } from 'hooks/scenarios';

import { setSubContentCollapsed } from 'store/features/analysis/ui';
import { scenarios, setScenarioTab } from 'store/features/analysis/scenarios';

import GrowthList from 'containers/growth/list/component';
import Button from 'components/button';
import InterventionsList from 'containers/interventions/list';
import Label from 'components/forms/label';
import { Input } from 'components/forms';
import Textarea from 'components/forms/textarea';

import type { ErrorResponse } from 'types';
import { setCurrentIntervention } from 'store/features/analysis';

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
  title: yup.string().min(2).required('Title must have at least two characters'),
  description: yup.string(),
});

const ScenariosNewContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const handleNewScenarioFeature = useCallback(() => {
    dispatch(setCurrentIntervention(null));
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  const { scenarioCurrentTab, currentScenario } = useAppSelector(scenarios);
  const { data: scenarioData } = useScenario(currentScenario);
  const { data: interventions } = useScenarioInterventions(currentScenario);

  const {
    register,
    getValues,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  const handleTab = useCallback((step) => dispatch(setScenarioTab(step)), [dispatch]);
  const [error, setError] = useState(null);

  const updateScenario = useUpdateScenario();
  const handleChange = useDebounceCallback(
    useCallback(() => {
      if (isValid) {
        updateScenario.mutate(
          { id: currentScenario, data: getValues() },
          {
            onSuccess: () => {
              toast.success('Your changes were successfully saved.');
              setError(null);
            },
            onError: (error: ErrorResponse) => {
              const { errors } = error.response?.data;
              errors.forEach(({ meta }) => setError(meta.rawError.response.message));
            },
          },
        );
      }
    }, [currentScenario, isValid, getValues, updateScenario]),
    600,
  );

  if (!scenarioData) return null;
  const { title, description } = scenarioData;
  return (
    <>
      <form action="#" method="POST" className="z-20">
        <Input
          {...register('title')}
          type="text"
          name="title"
          id="title"
          defaultValue={title}
          placeholder="Untitled"
          aria-label="Scenario title"
          autoFocus
          error={error}
          className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-400 p-0 font-semibold mb-6"
          onInput={handleChange}
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
            defaultValue={description}
            onInput={handleChange}
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
                  Interventions ({interventions?.length})
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
      </div>
    </>
  );
};

export default ScenariosNewContainer;
