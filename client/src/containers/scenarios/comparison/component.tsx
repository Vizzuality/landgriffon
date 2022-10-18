import { useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';

import { useScenarios } from 'hooks/scenarios';
import { useAppDispatch } from 'store/hooks';
import { setComparisonEnabled, setScenarioToCompare } from 'store/features/analysis/scenarios';
import Select from 'components/select';

import type { Dispatch, FC } from 'react';
import type { SelectOption } from 'components/select/types';

const ScenariosComparison: FC = () => {
  const router = useRouter();
  const { scenarioId, compareScenarioId } = router.query || {};
  const dispatch = useAppDispatch();

  const { data: scenarios } = useScenarios({
    params: { disablePagination: true, include: 'scenarioInterventions', scenarioId },
    options: {
      select: (data) => data.data,
    },
  });

  const options = useMemo<SelectOption[]>(() => {
    const filteredData = scenarios.filter(
      ({ id, scenarioInterventions }) => id !== scenarioId && scenarioInterventions?.length > 0,
    );
    return filteredData.map(({ id, title }) => ({ label: title, value: id }));
  }, [scenarioId, scenarios]);
  const selected = useMemo(
    () => options.find(({ value }) => value === compareScenarioId),
    [compareScenarioId, options],
  );

  const handleOnChange = useCallback<Dispatch<SelectOption>>(
    (current) => {
      // TO-DO: deprecated, we'll keep only for retro-compatibility
      dispatch(setComparisonEnabled(!!current));
      dispatch(setScenarioToCompare(current?.value || null));

      const queryParams = { ...router.query, compareScenarioId: current?.value };
      router.replace({
        pathname: router.pathname,
        query: queryParams,
      });
    },
    [dispatch, router],
  );

  // Reset comparison when options changes
  useEffect(() => {
    if (selected?.value && compareScenarioId !== selected?.value) {
      // TO-DO: deprecated, we'll keep only for retro-compatibility
      dispatch(setScenarioToCompare(null));
      setComparisonEnabled(false);

      const queryParams = { ...router.query, compareScenarioId: null, scenarioId: selected?.value };
      delete queryParams?.compareScenarioId;
      router.replace({
        pathname: router.pathname,
        query: queryParams,
      });
    }
  }, [selected, dispatch, options, compareScenarioId, router]);

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
