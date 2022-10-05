import { useCallback } from 'react';
import { RadioGroup } from '@headlessui/react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import {
  scenarios,
  setComparisonEnabled,
  setCurrentScenario,
  setScenarioToCompare,
} from 'store/features/analysis/scenarios';

import ScenarioItem from 'containers/scenarios/item';

import type { Scenario } from '../types';

type ScenariosListProps = {
  data: Scenario[];
};

/**
 * Actual data to the data response
 */
const ACTUAL_DATA: Scenario = {
  id: null, // reserved id only for actual-data
  title: 'Actual data',
};

const ScenariosList = ({ data }: ScenariosListProps) => {
  const { currentScenario } = useAppSelector(scenarios);
  const dispatch = useAppDispatch();

  const handleOnChange = useCallback(
    (id: Scenario['id']) => {
      dispatch(setCurrentScenario(id));
      dispatch(setComparisonEnabled(false));

      // TODO: if done one after the other, the query middleware overrides the values stored in the query params
      setTimeout(() => {
        dispatch(setScenarioToCompare(null));
      }, 0);
    },
    [dispatch],
  );

  return (
    <RadioGroup value={currentScenario} onChange={handleOnChange}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="relative grid grid-cols-1 gap-5 my-2 overflow-auto sm:gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <ScenarioItem scenario={ACTUAL_DATA} isSelected={!currentScenario} />
        {data.map((item) => (
          <ScenarioItem key={item.id} scenario={item} isSelected={currentScenario === item.id} />
        ))}
      </ul>
    </RadioGroup>
  );
};

export default ScenariosList;
