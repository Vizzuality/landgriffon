import { useCallback, useMemo, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';

import Select from 'components/select';

import { useIndicators } from 'hooks/indicators';

import type { SelectProps } from 'components/select/types';

const IndicatorsFilter: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const filters = useAppSelector(analysisFilters);
  const dispatch = useAppDispatch();

  const { data, isFetching, isFetched, error } = useIndicators();

  const options: SelectProps['options'] = useMemo(() => {
    const ALL = {
      id: 'all',
      name: 'All indicators',
    };

    let d = data || [];

    if (visualizationMode !== 'map') {
      d = [...[ALL], ...data];
    }

    return d.map((indicator) => ({ label: indicator.name, value: indicator.id }));
  }, [data, visualizationMode]);

  useEffect(() => {
    if (isFetched && options.length) {
      dispatch(
        setFilter({
          id: 'indicator',
          value: options[0],
        }),
      );
    }
  }, [options, isFetched, dispatch]);

  const handleChange: SelectProps['onChange'] = useCallback(
    (selected) => {
      dispatch(
        setFilter({
          id: 'indicator',
          value: selected,
        }),
      );
    },
    [dispatch],
  );

  return (
    <Select
      onChange={handleChange}
      loading={isFetching}
      options={options}
      current={filters.indicator}
      disabled={!!error}
    />
  );
};

export default IndicatorsFilter;
