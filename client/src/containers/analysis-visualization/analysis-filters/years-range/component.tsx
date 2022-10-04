import React, { useEffect, useMemo, useState } from 'react';
import { isFinite, toNumber, range } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';

import { useYears } from 'hooks/years';

import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();

  const [years, setYears] = useState<number[]>([]);
  const { visualizationMode } = useAppSelector(analysisUI);
  const filters = useAppSelector(analysisFilters);
  const { layer, materials, indicator } = filters;
  const { data, isLoading } = useYears(layer, materials, indicator);

  const { startYear, endYear, yearsGap, setYearsRange } = useYearsRange({
    years,
    // Map mode only makes use of the endYear and will display the Select,
    // not the YearsRangeFilter.
    validateRange: visualizationMode !== 'map',
    ...filters,
  });

  useEffect(() => {
    setYears(range(data[0], toNumber(data[data.length - 1] + 2) + 1));
  }, [data]);

  useEffect(() => {
    dispatch(setFilters({ startYear, endYear }));
  }, [startYear, endYear, dispatch]);

  const lastYearWithData = useMemo(() => data[data.length - 1], [data]);

  const handleOnEndYearSearch: (searchedYear: string) => void = (searchedYear) => {
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
  };

  return (
    <YearsRangeFilter
      loading={isLoading}
      startYear={startYear}
      endYear={endYear}
      years={years}
      yearsGap={yearsGap}
      showSearch
      onChange={setYearsRange}
      onEndYearSearch={handleOnEndYearSearch}
      lastYearWithData={lastYearWithData}
    />
  );
};

export default YearsFilter;
