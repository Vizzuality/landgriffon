import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { RadioGroup } from '@headlessui/react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { scenarios, setCurrentScenario } from 'store/features/analysis/scenarios';

import ScenarioItem from 'containers/scenarios/item';

import type { Scenario, Scenarios } from '../types';

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: 'actual-data', // reserved id only for actual-data
  title: 'Actual data',
};

type ScenariosListProps = {
  data: Scenarios;
};

const isScenarioSelected: (scenarioId: Scenario['id'], currentId: Scenario['id']) => boolean = (
  scenarioId,
  currentId,
): boolean => scenarioId.toString() === currentId?.toString();

const ScenariosList: React.FC<ScenariosListProps> = ({ data }: ScenariosListProps) => {
  const { currentScenario } = useAppSelector(scenarios);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const { query } = router;
  const { scenario } = query;

  const [selected, setSelected] = useState(null);

  const handleOnChange = useCallback(
    ({ id }) => {
      router.push({
        pathname: '/analysis',
        query: {
          ...router.query,
          scenario: id,
        },
      });
    },
    [router],
  );

  useEffect(() => {
    if (data && !currentScenario) {
      dispatch(setCurrentScenario(data[0].id as string)); // first option of the list by default
    }
    if (data && currentScenario) {
      setSelected(data.find(({ id }) => isScenarioSelected(id, currentScenario)));
    }
  }, [data, currentScenario, dispatch]);

  useEffect(() => {
    if (scenario) {
      dispatch(setCurrentScenario(scenario as string));
    }
  }, [dispatch, scenario]);

  return (
    <RadioGroup value={selected} onChange={handleOnChange}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="my-2 grid grid-cols-1 gap-5 sm:gap-2 sm:grid-cols-2 lg:grid-cols-1 relative">
        <ScenarioItem
          data={ACTUAL_DATA}
          isSelected={isScenarioSelected(ACTUAL_DATA.id, currentScenario)}
        />
        {data.map((item) => {
          return (
            <ScenarioItem
              key={item.id}
              data={item}
              isSelected={isScenarioSelected(item.id, currentScenario)}
            />
          );
        })}
      </ul>
    </RadioGroup>
  );
};

export default ScenariosList;
