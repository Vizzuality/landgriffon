import { useCallback, useMemo, useEffect } from 'react';

import { useScenarios } from 'hooks/scenarios';
import { useAppDispatch } from 'store/hooks';
import {
  setComparisonEnabled,
  setScenarioToCompare as setScenarioToCompareAction,
} from 'store/features/analysis/scenarios';
import Select from 'components/select';
import useEffectOnce from 'hooks/once';
import useQueryParam from 'hooks/queryParam';

import type { Dispatch, FC } from 'react';
import type { SelectOption } from 'components/select/types';

const ScenariosComparison: FC = () => {
  const [scenarioId, setScenarioId] = useQueryParam<string>('scenarioId');
  const [compareScenarioId, setCompareScenarioId] = useQueryParam<string>('compareScenarioId');
  const dispatch = useAppDispatch();

  const { data: scenarios } = useScenarios({
    params: { disablePagination: true, hasInterventions: true },
    options: {
      select: (data) => data.data,
    },
  });

  const options = useMemo<SelectOption[]>(() => {
    const filteredData = scenarios.filter(({ id }) => id !== scenarioId);
    return filteredData.map(({ id, title }) => ({ label: title, value: id }));
  }, [scenarioId, scenarios]);
  const selected = useMemo(
    () => options.find(({ value }) => value === compareScenarioId),
    [compareScenarioId, options],
  );

  const handleOnChange = useCallback<Dispatch<SelectOption>>(
    (current) => {
      // TODO: deprecated, we'll keep only for retro-compatibility
      dispatch(setComparisonEnabled(!!current));
      dispatch(setScenarioToCompareAction(current?.value || null));

      setCompareScenarioId(current?.value || null);
    },
    [dispatch, setCompareScenarioId],
  );

  // Reset comparison when options changes
  useEffect(() => {
    if (selected?.value && compareScenarioId !== selected?.value) {
      // TO-DO: deprecated, we'll keep only for retro-compatibility
      dispatch(setScenarioToCompareAction(null));
      dispatch(setComparisonEnabled(false));

      setCompareScenarioId(null);
      setScenarioId(selected?.value || null);
    }
  }, [selected, dispatch, options, compareScenarioId, setCompareScenarioId, setScenarioId]);

  // We consider comparison is enabled when compareScenarioId is present
  useEffectOnce(() => {
    if (compareScenarioId) dispatch(setComparisonEnabled(true));
  });

  return (
    <div data-testid="comparison-select">
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
