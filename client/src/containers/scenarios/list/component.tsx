import { useEffect, useState, useCallback } from 'react';
import { RadioGroup } from '@headlessui/react';

import { useAppDispatch } from 'store/hooks';
import { setCurrentScenario } from 'store/features/analysis/scenarios';

import ScenarioItem from 'containers/scenarios/item';
import { ACTUAL_DATA } from '../constants';

import type { Scenario, Scenarios } from '../types';
import Link from 'next/link';
import { useRouter } from 'next/router';

type ScenariosListProps = {
  data: Scenarios;
};

const isScenarioSelected: (scenarioId: Scenario['id'], currentId: Scenario['id']) => boolean = (
  scenarioId,
  currentId,
): boolean => scenarioId.toString() === currentId?.toString();

const ScenariosList: React.FC<ScenariosListProps> = ({ data }: ScenariosListProps) => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState(ACTUAL_DATA);
  const handleOnChange = useCallback(({ id }) => dispatch(setCurrentScenario(id)), [dispatch]);

  // get id from url
  const router = useRouter();
  const { asPath } = router;

  useEffect(() => {
    const id = asPath.split('/analysis/scenarios/', 2)[1];
    if (data && !id) {
      setSelected(ACTUAL_DATA);
      dispatch(setCurrentScenario(ACTUAL_DATA.id as string)); // first option of the list by default
    }
    if (data && id) {
      if (id === ACTUAL_DATA.id) {
        setSelected(ACTUAL_DATA);
      } else {
        setSelected(data.find(({ id: dataId }) => isScenarioSelected(dataId, id as string)));
      }
    }
  }, [data, asPath, router, selected, dispatch]);

  return (
    <RadioGroup value={selected} onChange={handleOnChange}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="overflow-auto my-2 grid grid-cols-1 gap-5 sm:gap-2 sm:grid-cols-2 lg:grid-cols-1 relative">
        <Link
          href={{ pathname: '/analysis', query: { name: '/scenarios', id: `${ACTUAL_DATA.id}` } }}
          key={ACTUAL_DATA.id}
          as="/analysis"
          shallow
          passHref
        >
          <a href={`/analysis`}>
            <ScenarioItem
              data={ACTUAL_DATA}
              isSelected={isScenarioSelected(ACTUAL_DATA.id, selected.id as string)}
            />
          </a>
        </Link>
        {data.map((item) => {
          return (
            <Link
              href={{ pathname: '/analysis' }}
              key={item.id}
              as={`/analysis/scenarios/${item.id}`}
              shallow
              passHref
            >
              <a href={`/analysis/scenarios/${item.id}`}>
                <ScenarioItem
                  key={item.id}
                  data={item}
                  isSelected={isScenarioSelected(item.id, selected.id as string)}
                />
              </a>
            </Link>
          );
        })}
      </ul>
    </RadioGroup>
  );
};

export default ScenariosList;
