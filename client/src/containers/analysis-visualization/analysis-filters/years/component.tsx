import React, { useEffect, useMemo, useState } from 'react';
import { isFinite, toNumber } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { useYears } from 'hooks/years';

import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import Select, { SelectProps } from 'components/select';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();

  const [years, setYears] = useState<number[]>([]);
  const { visualizationMode, filters, layer } = useAppSelector(analysis);
  const { materials, indicator } = filters;
  const { data, isLoading } = useYears(layer, materials, indicator);

  const { startYear, endYear, yearsGap, setYearsRange } = useYearsRange({
    years: years,
    yearsGap: 5,
    // Map mode only makes use of the endYear and will display the Select,
    // not the YearsRangeFilter.
    validateRange: visualizationMode !== 'map',
    ...filters,
  });

  useEffect(() => {
    setYears(data);
  }, [data]);

  useEffect(() => {
    dispatch(setFilter({ id: 'startYear', value: startYear }));
    dispatch(setFilter({ id: 'endYear', value: endYear }));
  }, [startYear, endYear, dispatch]);

  const yearSelectCurrentOption = useMemo(
    () => ({ label: endYear?.toString(), value: endYear }),
    [endYear],
  );

  const yearSelectOptions = useMemo(
    () => years?.map((year) => ({ label: year.toString(), value: year })),
    [years],
  );

  const handleOnEndYearSearch: SelectProps['onSearch'] = (searchedYear) => {
    if (!isFinite(toNumber(searchedYear)) || toNumber(searchedYear) <= data[0]) {
      return;
    }

    if (!years.includes(toNumber(searchedYear))) {
      setYears([toNumber(searchedYear), ...data]);
    }
  };

  return visualizationMode === 'map' ? (
    <Select
      loading={isLoading}
      current={yearSelectCurrentOption}
      options={yearSelectOptions}
      placeholder="Year"
      showSearch
      onChange={({ value }) => setFilter({ id: 'endYear', value: value })}
    />
  ) : (
    <YearsRangeFilter
      loading={isLoading}
      startYear={startYear}
      endYear={endYear}
      years={years}
      yearsGap={yearsGap}
      showEndYearSearch={true}
      onChange={setYearsRange}
      onEndYearSearch={handleOnEndYearSearch}
    />
  );
};

export default YearsFilter;
