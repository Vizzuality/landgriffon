import { useState, useCallback, useEffect } from 'react';

import { UseYearsRangeProps, YearsRangeParams } from './types';

export function useYearsRange({
  years,
  yearsGap = 0,
  startYear: initialStartYear,
  endYear: initialEndYear,
}: UseYearsRangeProps): UseYearsRangeProps {
  const [startYear, setStartYear] = useState<number>(initialStartYear);
  const [endYear, setEndYear] = useState<number>(initialEndYear);

  const setYearsRange = useCallback(
    ({ startYear: startYearParam, endYear: endYearParam }: YearsRangeParams) => {
      setStartYear(startYearParam);
      setEndYear(endYearParam);
    },
    [],
  );

  useEffect(() => {
    // If we don't have a years array there's nothing to set
    if (!years) return;

    // If we don't have a startYear nor an endYear, we need to set them with the default values in the array.
    if (!startYear || !endYear) {
      if (!startYear) setStartYear(years[0]);
      if (!endYear) setEndYear(years[years.length - 1]);
      return;
    }

    const firstYear = years[0];
    const lastYear = years[years.length - 1];

    // We have a startYear and an endYear, but they fall out of the years array boundaries. Correct that.
    if (startYear <= firstYear || endYear >= lastYear) {
      setStartYear(firstYear);
      setEndYear(lastYear);
      return;
    }

    // We have a startYear and endYear, they're within array boundaries, but the year gap is not respected
    if (endYear - startYear < yearsGap) {
      if (lastYear - firstYear < yearsGap) {
        setStartYear(firstYear);
        setEndYear(lastYear);
        return;
      } else {
        // We have a years gap set, but not enough data to respect it.
        console.error('Years gap cannot be respected; not enough years data');
      }
    }
  }, [endYear, setYearsRange, startYear, years, yearsGap]);

  return {
    years,
    yearsGap,
    startYear,
    endYear,
    setStartYear,
    setEndYear,
    setYearsRange,
  };
}
