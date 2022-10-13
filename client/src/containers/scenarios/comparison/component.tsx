import type { Dispatch, FC } from 'react';
import { useCallback, useMemo, useEffect } from 'react';

import { useScenarios } from 'hooks/scenarios';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  scenarios as scenariosSelector,
  setComparisonEnabled,
  setScenarioToCompare,
} from 'store/features/analysis/scenarios';

import Select from 'components/select';

import type { SelectOption } from 'components/select/types';

const ScenariosComparison: FC = () => {
  const dispatch = useAppDispatch();
  const { currentScenario, scenarioToCompare } = useAppSelector(scenariosSelector);

  const { data: scenarios } = useScenarios({
    params: { disablePagination: true, include: 'scenarioInterventions', currentScenario },
    options: {
      select: (data) => data.data,
    },
  });

  const options = useMemo<SelectOption[]>(() => {
    const filteredData = scenarios.filter(
      ({ id, scenarioInterventions }) =>
        id !== currentScenario && scenarioInterventions?.length > 0,
    );
    return filteredData.map(({ id, title }) => ({ label: title, value: id }));
  }, [currentScenario, scenarios]);
  const selected = useMemo(
    () => options.find(({ value }) => value === scenarioToCompare),
    [scenarioToCompare, options],
  );

  const handleOnChange = useCallback<Dispatch<SelectOption>>(
    (current) => {
      dispatch(setComparisonEnabled(!!current));
      dispatch(setScenarioToCompare(current?.value || null));
    },
    [dispatch],
  );

  // Reset comparison when options changes
  useEffect(() => {
    if (selected?.value && scenarioToCompare !== selected?.value) {
      dispatch(setScenarioToCompare(null));
      setComparisonEnabled(false);
    }
  }, [selected, dispatch, options, scenarioToCompare]);

  return (
    <div>
      <label className="block mb-1 text-sm text-gray-500">Compare with:</label>
      <Select
        showSearch
        current={selected}
        options={options}
        placeholder="Select what to compare"
        allowEmpty
        onChange={handleOnChange}
      />
    </div>
  );
};

export default ScenariosComparison;
