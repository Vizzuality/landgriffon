import { useCallback, useMemo, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';

import { useIndicators } from 'lib/hooks/indicators';

type ImpactIndicatorsFilterProps = {};

const ImpactIndicatorsFilter: React.FC<ImpactIndicatorsFilterProps> = () => {
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
    dispatch(
      setFilter({
        id: 'indicator',
        value: options[0].value,
      })
    );
  }, [options, isFetched]);

  const handleChange = useCallback((currentValue) => {
    dispatch(
      setFilter({
        id: 'indicator',
        value: currentValue,
      })
    );
  }, []);

  return (
    <Select
      onChange={handleChange}
      className="w-60"
      loading={isFetching}
      options={options}
      value={filters.indicator}
      placeholder={error ? 'Something went wrong' : 'Select Impact Indicator'}
      disabled={!!error}
      suffixIcon={<ChevronDownIcon />}
    />
  );
};

export default ImpactIndicatorsFilter;
