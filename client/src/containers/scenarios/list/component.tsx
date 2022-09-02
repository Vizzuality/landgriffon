import { useEffect, useState, useCallback } from 'react';
import { RadioGroup } from '@headlessui/react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  scenarios,
  setCurrentScenario,
  setScenarioToCompare,
} from 'store/features/analysis/scenarios';

import ScenarioItem from 'containers/scenarios/item';

import { ACTUAL_DATA } from '../constants';

import type { Scenario, Scenarios } from '../types';

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

  const [selected, setSelected] = useState(null);

  const handleOnChange = useCallback(
    ({ id }) => {
      dispatch(setCurrentScenario(id));
      dispatch(setScenarioToCompare(null));
    },
    [dispatch],
  );

  useEffect(() => {
    if (data && !currentScenario) {
      dispatch(setCurrentScenario(ACTUAL_DATA.id as string)); // first option of the list by default
    }
    if (data && currentScenario) {
      if (currentScenario === ACTUAL_DATA.id) {
        setSelected(ACTUAL_DATA);
      } else {
        setSelected(data.find(({ id }) => isScenarioSelected(id, currentScenario)));
      }
    }
  }, [data, currentScenario, dispatch]);

  return (
    <RadioGroup value={selected} onChange={handleOnChange}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="relative grid grid-cols-1 gap-5 my-2 overflow-auto sm:gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <ScenarioItem
          data={ACTUAL_DATA}
          isSelected={isScenarioSelected(ACTUAL_DATA.id, currentScenario)}
        />
        {data.map((item) => (
          <ScenarioItem
            key={item.id}
            data={item}
            isSelected={isScenarioSelected(item.id, currentScenario)}
            onClick={setSelected}
          />
        ))}
      </ul>
    </RadioGroup>
  );
};

export default ScenariosList;
