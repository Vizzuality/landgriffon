import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter, setFilters } from 'store/features/analysis/filters';
import { useYears } from 'hooks/years';
import Select from 'components/forms/select';

import type { SelectProps } from 'components/forms/select/types';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const { layer, materials, indicator, startYear } = filters;

  const materialsIds = useMemo(() => materials.map((mat) => mat.value), [materials]);
  const { data: years, isLoading } = useYears(layer, materialsIds, indicator?.value);
  const [selectedOption, setSelectedOption] = useState<SelectProps['value']>(null);

  useEffect(() => {
    setSelectedOption({
      label: startYear?.toString(),
      value: startYear,
    });
  }, [startYear]);

  const yearOptions: SelectProps['options'] = useMemo(
    () =>
      years?.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [years],
  );

  const handleChange: SelectProps['onChange'] = useCallback(
    (option) => {
      setSelectedOption(option);
      dispatch(setFilter({ id: 'startYear', value: option.value }));
    },
    [dispatch],
  );

  // Update filters when data changes
  useEffect(() => {
    if (years?.length && !isLoading) {
      dispatch(
        setFilters({ ...(startYear ? {} : { startYear: years[years.length - 1] }), endYear: null }),
      );
    }
  }, [dispatch, isLoading, years, startYear]);

  return (
    <Select
      icon={<span className="text-sm text-gray-400">in</span>}
      loading={isLoading}
      value={selectedOption}
      options={yearOptions}
      placeholder="Select a year"
      onChange={handleChange}
    />
  );
};

export default YearsFilter;