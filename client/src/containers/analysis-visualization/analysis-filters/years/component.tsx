import React, { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter, setFilters } from 'store/features/analysis/filters';

import { useYears } from 'hooks/years';

import Select, { SelectProps } from 'components/select';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const { layer, materials, indicator, startYear } = filters;
  const { data: years, isLoading } = useYears(layer, materials, indicator);

  const yearOptions: SelectProps['options'] = useMemo(
    () => years?.map((year) => ({ label: year.toString(), value: year })),
    [years],
  );

  // Always set a value
  const yearSelected: SelectProps['current'] = useMemo(
    () => ({ label: startYear?.toString(), value: startYear }),
    [startYear],
  );

  const handleChange: SelectProps['onChange'] = useCallback(
    ({ value }) => {
      dispatch(setFilter({ id: 'startYear', value: value }));
    },
    [dispatch],
  );

  // Update filters when data changes
  useEffect(() => {
    if (years && !isLoading) {
      dispatch(setFilters({ startYear: years[years.length - 1], endYear: null }));
    }
  }, [dispatch, isLoading, years]);

  return (
    <Select
      loading={isLoading}
      current={yearSelected}
      options={yearOptions}
      placeholder="Year"
      showSearch
      onChange={handleChange}
    />
  );
};

export default YearsFilter;
