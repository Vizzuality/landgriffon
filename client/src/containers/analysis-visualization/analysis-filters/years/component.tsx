import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter, setFilters } from 'store/features/analysis/filters';

import { useYears } from 'hooks/years';

import type { SelectProps } from 'components/select';
import Select from 'components/select';
import { toNumber, range } from 'lodash';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const { layer, materials, indicator, startYear } = filters;
  const { data, isLoading } = useYears(layer, materials, indicator);

  const [years, setYears] = useState(data);

  const [selectedOption, setSelectedOption] = useState<SelectProps<number>['current']>(null);

  useEffect(() => {
    setSelectedOption({
      label: startYear?.toString(),
      value: startYear,
    });
  }, [startYear]);

  useEffect(() => {
    setYears([...range(data[0], data[data.length - 1] + 3)]);
  }, [data]);
  const lastAvailableYear = data[data.length - 1];
  const yearOptions: SelectProps<number>['options'] = useMemo(
    () =>
      years?.map((year) => ({
        label: year.toString(),
        value: year,
        extraInfo: year > lastAvailableYear ? 'projected data' : null,
      })),
    [lastAvailableYear, years],
  );

  const handleSearch: SelectProps['onSearch'] = useCallback(
    (searchedYear) => {
      const year = toNumber(searchedYear);

      if (!isFinite(year) || year <= data[0]) {
        return;
      }

      // TODO: set max number of years, otherwise an extra number la va a liar parda
      if (year === data[data.length - 1]) {
        setYears(range(data[0], data[data.length - 1] + 2));
      } else if (!years.includes(year)) {
        setYears(range(data[0], year + 1));
      }
    },
    [data, years],
  );

  const handleChange: SelectProps<number>['onChange'] = useCallback(
    (option) => {
      setSelectedOption(option);
      dispatch(setFilter({ id: 'startYear', value: option.value }));
    },
    [dispatch],
  );

  // Update filters when data changes
  useEffect(() => {
    if (data?.length && !isLoading) {
      dispatch(
        setFilters({ ...(startYear ? {} : { startYear: data[data.length - 1] }), endYear: null }),
      );
    }
  }, [dispatch, isLoading, data, startYear]);

  return (
    <Select
      numeric
      label="in"
      instanceId="year-selector"
      hideValueWhenMenuOpen
      loading={isLoading}
      current={selectedOption}
      options={yearOptions}
      placeholder="Type any year"
      showSearch
      onSearch={handleSearch}
      onChange={handleChange}
    />
  );
};

export default YearsFilter;
