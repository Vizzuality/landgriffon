import React, { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { useYears } from 'hooks/years';

import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';
import Select from 'components/select';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();

  const { visualizationMode, filters, layer } = useAppSelector(analysis);
  const { materials, indicator } = filters;
  const { data: years, isLoading } = useYears(layer, materials, indicator);

  const { startYear, endYear, yearsGap, setYearsRange } = useYearsRange({
    years: years,
    yearsGap: 5,
    ...filters,
  });

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
      onChange={setYearsRange}
    />
  );
};

export default YearsFilter;
