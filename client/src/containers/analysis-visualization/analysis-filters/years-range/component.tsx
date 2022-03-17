import React, { useEffect, useState } from 'react';
import { isFinite, toNumber } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';

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

  const handleOnEndYearSearch = (searchedYear) => {
    if (!isFinite(toNumber(searchedYear)) || toNumber(searchedYear) <= data[0]) {
      return;
    }

    if (!years.includes(toNumber(searchedYear))) {
      setYears([toNumber(searchedYear), ...data]);
    }
  };

  return (
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
