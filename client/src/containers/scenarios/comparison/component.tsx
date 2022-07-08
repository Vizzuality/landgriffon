import { FC, useCallback, useMemo, useEffect } from 'react';

import { useScenarios } from 'hooks/scenarios';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { scenarios, setScenarioToCompare } from 'store/features/analysis/scenarios';

import Select from 'components/select';

import type { SelectOption } from 'components/select/types';

const ScenariosComparison: FC = () => {
  const dispatch = useAppDispatch();
  const { currentScenario, scenarioToCompare, isComparisonEnabled } = useAppSelector(scenarios);

  const { data } = useScenarios({ disablePagination: true });
  const options: SelectOption[] = useMemo(() => {
    if (currentScenario === 'actual-data') {
      return data.map(({ id, title }) => ({ label: title, value: id }));
    }
    return [{ label: 'Actual Data', value: 'actual-data' }];
  }, [currentScenario, data]);
  const selected = useMemo(
    () => options.find(({ value }) => value === scenarioToCompare),
    [scenarioToCompare, options],
  );

  const handleOnChange = useCallback(
    (current) => {
      dispatch(setScenarioToCompare(current.value));
    },
    [dispatch],
  );

  // Reset comparison when options changes
  useEffect(() => {
    dispatch(setScenarioToCompare(null));
  }, [dispatch, options]);

  return (
    <div className="mt-2 space-y-1">
      <Select
        showSearch
        current={selected}
        options={options}
        placeholder="Select scenario to compare"
        disabled={!isComparisonEnabled}
        onChange={handleOnChange}
      />
    </div>
  );
};

export default ScenariosComparison;
