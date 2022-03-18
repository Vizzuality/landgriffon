import { useCallback } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';
import { useForm } from 'react-hook-form';
import cx from 'classnames';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { useScenario, useUpdateScenario } from 'hooks/scenarios';
import { useInterventions } from 'hooks/interventions';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis/ui';
import { setScenarioTab, scenarios } from 'store/features/analysis/scenarios';

import Button from 'components/button';
import InterventionsList from 'containers/interventions/list';
import { Label, Input, Textarea } from 'components/forms';
import GrowthList from 'containers/growth/list/component';
import { PlusIcon } from '@heroicons/react/solid';

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
  const { query } = useRouter();

  const dispatch = useAppDispatch();
  const { scenarioCurrentTab, currentScenario } = useAppSelector(scenarios);

  const {
    register,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schemaValidation),
  });

  const { data: scenario, isLoading } = useScenario(currentScenario as string, { sort: 'title' });
  const { data: interventions } = useInterventions({ sort: query.sortBy as string });

  const updateScenario = useUpdateScenario();

  const handleNewScenarioFeature = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  const handleTab = useCallback((step) => dispatch(setScenarioTab(step)), [dispatch]);

  const handleChange = useDebounceCallback(
    useCallback(() => {
      const { id } = scenario;
      if (isValid) {
        updateScenario.mutate(
          { id, data: getValues() },
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
    }, [scenario, isValid, updateScenario, getValues]),
    500,
  );

  return (
    <>
      <form className="z-20">
        <Input
          type="text"
          {...register('title')}
          placeholder="Untitled"
          defaultValue={scenario.title}
          aria-label="Scenario title"
          className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-900 p-0 mb-6"
          onInput={handleChange}
          disabled={isLoading}
          error={errors.title?.message}
        />

        <div className="sm:col-span-6">
          <Label htmlFor="description">
            Scenario description <span className="text-gray-500">(optional)</span>
          </Label>
          <Textarea
            {...register('description')}
            rows={3}
            className="w-full"
            defaultValue={scenario.description}
            disabled={isLoading}
            error={errors.description?.message}
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
