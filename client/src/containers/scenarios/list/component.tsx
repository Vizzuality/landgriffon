import { useEffect, useCallback } from 'react';
import { RadioGroup } from '@headlessui/react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  scenarios,
  setCurrentScenario,
  setScenarioToCompare,
} from 'store/features/analysis/scenarios';

import ScenarioItem from 'containers/scenarios/item';

import { ACTUAL_DATA } from '../constants';

import type { Scenario } from '../types';

type ScenariosListProps = {
  data: Scenario[];
};

const isScenarioSelected: (scenarioId: Scenario['id'], currentId: Scenario['id']) => boolean = (
  scenarioId,
  currentId,
): boolean => scenarioId.toString() === currentId?.toString();

const ScenariosList = ({ data }: ScenariosListProps) => {
  const { currentScenario } = useAppSelector(scenarios);
  const dispatch = useAppDispatch();

  const handleOnChange = useCallback(
    (id: Scenario['id']) => {
      dispatch(setCurrentScenario(id)).payload;
      setTimeout(() => {
        dispatch(setScenarioToCompare(null));
      }, 10);
    },
    [dispatch],
  );

  useEffect(() => {
    if (data && !currentScenario) {
      dispatch(setCurrentScenario(ACTUAL_DATA.id as string)); // first option of the list by default
    }
  }, [data, currentScenario, dispatch]);

  return (
    <RadioGroup value={currentScenario} onChange={handleOnChange}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="relative grid grid-cols-1 gap-5 my-2 overflow-auto sm:gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <ScenarioItem
          scenario={ACTUAL_DATA}
          isSelected={isScenarioSelected(ACTUAL_DATA.id, currentScenario)}
        />
        {data.map((item) => (
          <ScenarioItem
            key={item.id}
            scenario={item}
            isSelected={isScenarioSelected(item.id, currentScenario)}
          />
        ))}
      </ul>
    </RadioGroup>
  );
};

export default ScenariosList;
