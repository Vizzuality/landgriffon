import { useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { pickBy } from 'lodash-es';

import { useScenarios } from 'hooks/scenarios';
import { useAppDispatch } from 'store/hooks';
import {
  setComparisonEnabled,
  setScenarioToCompare as setScenarioToCompareAction,
} from 'store/features/analysis/scenarios';
import { AutoCompleteSelect } from 'components/forms/select';
import useEffectOnce from 'hooks/once';

import type { Option } from 'components/forms/select';
import type { Dispatch, FC } from 'react';

const ScenariosComparison: FC = () => {
  const { query, push } = useRouter();
  const { scenarioId, compareScenarioId } = query;
  const dispatch = useAppDispatch();

  const { data: scenarios } = useScenarios({
    params: { disablePagination: true, hasActiveInterventions: true, sort: '-updatedAt' },
    options: {
      select: (data) => data.data,
    },
  });

  const options = useMemo<Option[]>(() => {
    const filteredData = scenarios.filter(({ id }) => id !== scenarioId);
    return filteredData.map(({ id, title }) => ({ label: title, value: id }));
  }, [scenarioId, scenarios]);

  const selected = useMemo(
    () => options.find(({ value }) => value === compareScenarioId),
    [compareScenarioId, options],
  );

  const handleOnChange = useCallback<Dispatch<Option>>(
    (current) => {
      // TODO: deprecated, we'll keep only for retro-compatibility
      dispatch(setComparisonEnabled(!!current));
      dispatch(setScenarioToCompareAction(current?.value || null));

      push({ query: pickBy({ ...query, compareScenarioId: current?.value || null }) }, null, {
        shallow: true,
      });
    },
    [dispatch, push, query],
  );

  const handleScenarioRemoval = useCallback(() => {
    // TODO: deprecated, we'll keep only for retro-compatibility
    dispatch(setComparisonEnabled(false));
    dispatch(setScenarioToCompareAction(null));

    push({ query: pickBy({ ...query, compareScenarioId: null }) }, null, {
      shallow: true,
    });
  }, [dispatch, push, query]);

  // Reset comparison when options changes
  useEffect(() => {
    if (selected?.value && compareScenarioId !== selected?.value) {
      // TO-DO: deprecated, we'll keep only for retro-compatibility
      dispatch(setScenarioToCompareAction(null));
      dispatch(setComparisonEnabled(false));

      push(
        {
          query: pickBy({ ...query, compareScenarioId: null, scenarioId: selected?.value || null }),
        },
        null,
        {
          shallow: true,
        },
      );
    }
  }, [selected, dispatch, options, compareScenarioId, push, query]);

  // We consider comparison is enabled when compareScenarioId is present
  useEffectOnce(() => {
    if (compareScenarioId) dispatch(setComparisonEnabled(true));
  });

  return (
    <>
      <label className="block mb-1 text-sm text-gray-500">Compare with:</label>
      <AutoCompleteSelect
        value={selected}
        options={options}
        placeholder="Select what to compare"
        onChange={handleOnChange}
        data-testid="comparison"
        clearable
        onClearSelection={handleScenarioRemoval}
      />
    </>
  );
};

export default ScenariosComparison;
