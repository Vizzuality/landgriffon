import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { RadioGroup } from '@headlessui/react';
import ScenarioItem from 'containers/scenarios/item';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysis, setCurrentScenario } from 'store/features/analysis';
import type { Scenario, Scenarios } from '../types';

type ScenariosListProps = {
  data: Scenarios;
};

const isScenarioSelected: (scenarioId: Scenario['id'], currentId: Scenario['id']) => boolean = (
  scenarioId,
  currentId,
): boolean => scenarioId.toString() === currentId?.toString();

const ScenariosList: React.FC<ScenariosListProps> = ({ data }: ScenariosListProps) => {
  const { currentScenario } = useAppSelector(analysis);
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
      router.push({
        pathname: '/analysis',
        query: {
          ...router.query,
          scenario: data[0].id, // by default firs option of the list
        },
      });
    }
    if (data && currentScenario) {
      setSelected(data.find(({ id }) => isScenarioSelected(id, currentScenario)));
    }
  }, [data, currentScenario, router]);

  useEffect(() => {
    if (scenario) {
      dispatch(setCurrentScenario(scenario as string));
    }
  }, [dispatch, scenario]);

  return (
    <RadioGroup value={selected} onChange={handleOnChange}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="my-2 grid grid-cols-1 gap-5 sm:gap-2 sm:grid-cols-2 lg:grid-cols-1 relative">
        {data.map((item) => (
          <ScenarioItem
            key={item.id}
            data={item}
            isSelected={isScenarioSelected(item.id, currentScenario)}
          />
        ))}
      </ul>
    </RadioGroup>
  );
};

export default ScenariosList;
