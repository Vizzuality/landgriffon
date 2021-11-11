import { useCallback, useMemo, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';

import { useIndicators } from 'hooks/indicators';

const ImpactIndicatorsFilter: React.FC = () => {
  const { visualizationMode, filters } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const { data, isFetching, isFetched, error } = useIndicators();

  const options = useMemo(() => {
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
  }, [options, isFetched]);

  const handleChange = useCallback((currentValue, currentOption) => {
    dispatch(
      setFilter({
        id: 'indicator',
        value: currentOption,
      }),
    );
  }, []);

  return (
    <Select
      defaultActiveFirstOption
      onChange={handleChange}
      className="w-60"
      loading={isFetching}
      options={options}
      value={filters.indicator?.value}
      placeholder={error ? 'Something went wrong' : 'Select Impact Indicator'}
      disabled={!!error}
      suffixIcon={<ChevronDownIcon />}
    />
  );
};

export default ImpactIndicatorsFilter;
