import React, { useEffect, useMemo, useState } from 'react';
import { isFinite, toNumber, range } from 'lodash-es';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import { useYears } from 'hooks/years';
import YearsRangeFilter, { useYearsRange } from 'containers/filters/years-range';

import type { YearsRangeParams } from 'containers/filters/years-range';

/** Arbitrary value to define the end year list range */
const DEFAULT_END_YEAR_GAP = 5;
/** Arbitrary value to define the max range of end year options to avoid performance issues */
const MAX_END_YEAR_RANGE = 1000;

const YearsRange: React.FC = () => {
  const dispatch = useAppDispatch();

  const [years, setYears] = useState<number[]>([]);
  const { visualizationMode } = useAppSelector(analysisUI);
  const filters = useAppSelector(analysisFilters);
  const { layer, materials, indicator } = filters;

  const materialIds = useMemo(() => materials.map((mat) => mat.value), [materials]);

  const { data, isLoading } = useYears(layer, materialIds, indicator?.value, {
    enabled: !!(layer === 'impact' && indicator?.value) || true,
  });

  const { startYear, endYear, yearsGap, setYearsRange } = useYearsRange({
    years,
    yearsGap: 1,
    // Map mode only makes use of the endYear and will display the Select,
    // not the YearsRangeFilter.
    validateRange: visualizationMode !== 'map',
    ...filters,
  });

  const lastYearWithData = useMemo(() => data[data.length - 1], [data]);
  const defaultLastYear = useMemo(
    () => lastYearWithData + DEFAULT_END_YEAR_GAP,
    [lastYearWithData],
  );

  useEffect(() => {
    setYears(range(data[0], defaultLastYear + 1));
  }, [data, defaultLastYear]);

  useEffect(() => {
    dispatch(setFilters({ startYear, endYear }));
  }, [startYear, endYear, dispatch]);

  const handleOnEndYearSearch: (searchedYear: string) => void = (searchedYear) => {
    const year = toNumber(searchedYear);

    if (!isFinite(year) || year <= data[0]) {
      return;
    }
    if (year > MAX_END_YEAR_RANGE + defaultLastYear) {
      toast.error(`Max year limit is ${MAX_END_YEAR_RANGE + defaultLastYear}`);
      return;
    }

    if (year === lastYearWithData) {
      setYears(range(data[0], defaultLastYear + 1));
    } else if (!years.includes(year)) {
      setYears(range(data[0], year + 1));
    }
  };

  const handleYearChange = ({ startYear, endYear }: YearsRangeParams) => {
    const lastYear = years[years.length - 1];
    // Reduce the years range in case the current selected end year is smaller than the previous and the previous range was larger than the default
    if (endYear < lastYear) {
      if (endYear > defaultLastYear) {
        setYears(range(years[0], toNumber(endYear) + 1));
      } else {
        setYears(range(years[0], defaultLastYear + 1));
      }
    }
    if (endYear) setYearsRange({ startYear, endYear });
  };

  return (
    <YearsRangeFilter
      loading={isLoading}
      startYear={startYear}
      endYear={endYear}
      years={years}
      yearsGap={yearsGap}
      showSearch
      onChange={handleYearChange}
      onEndYearSearch={handleOnEndYearSearch}
      lastYearWithData={lastYearWithData}
      placeholderFrom="Select a year"
    />
  );
};

export default YearsRange;
