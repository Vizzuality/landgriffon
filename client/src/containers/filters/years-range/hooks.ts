import { useState, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

import type { UseYearsRangeProps, YearsRangeParams } from './types';

export function useYearsRange({
  years: yearsProp = [],
  yearsGap = 0,
  startYear: initialStartYear,
  endYear: initialEndYear,
  validateRange = true,
}: UseYearsRangeProps): UseYearsRangeProps {
  const [startYear, setStartYear] = useState<number>(initialStartYear);
  const [endYear, setEndYear] = useState<number>(initialEndYear);

  const years = useMemo(() => yearsProp.sort(), [yearsProp]);

  const setYearsRange = useCallback(
    ({ startYear: startYearParam, endYear: endYearParam }: YearsRangeParams) => {
      setStartYear(startYearParam);
      setEndYear(endYearParam);
    },
    [],
  );

  const invalidRange = useMemo(
    () => endYear - startYear < yearsGap,
    [endYear, startYear, yearsGap],
  );
  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  useEffect(() => {
    // If we don't have a years array there's nothing to set
    if (!years) return;

    // If we don't have a startYear nor an endYear, we need to set them with the default values in the array.
    if (!startYear || !endYear) {
      if (!startYear) setStartYear(firstYear);
      if (!endYear) setEndYear(lastYear);
      return;
    }
  }, [startYear, endYear, firstYear, lastYear, years]);

  useEffect(() => {
    // If we don't have a years array there's nothing to set
    if (!years) return;

    // If we don't have a startYear nor an endYear, we need to set them with the default values in the array.
    if (!startYear || !endYear) {
      if (!startYear) setStartYear(firstYear);
      if (!endYear) setEndYear(years[years.length - 1]);
      return;
    }

    // We have a startYear and an endYear, but they fall out of the years array boundaries. Correct that.
    if (validateRange && (startYear < firstYear || endYear > lastYear)) {
      setStartYear(firstYear);
      setEndYear(lastYear);
      return;
    }

    // We have a startYear and endYear, they're within array boundaries, but the year gap is not respected
    if (invalidRange) {
      if (lastYear - firstYear < yearsGap) {
        setStartYear(firstYear);
        setEndYear(lastYear);
        return;
      } else {
        // We have a years gap set, but not enough data to respect it.
        toast.error('Years gap cannot be respected; not enough years data');
      }
    }
  }, [
    invalidRange,
    setYearsRange,
    startYear,
    validateRange,
    years,
    yearsGap,
    endYear,
    lastYear,
    firstYear,
  ]);

  const yearsInRange = useMemo(
    () =>
      years.filter((year) => (startYear && endYear ? year >= startYear && year <= endYear : true)),
    [endYear, startYear, years],
  );

  return {
    years,
    yearsInRange,
    yearsGap,
    startYear,
    endYear,
    setStartYear,
    setEndYear,
    setYearsRange,
  };
}
