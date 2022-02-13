import { useState } from 'react';

import { UseYearsRangeProps, YearsRangeParams } from './types';

export function useYearsRange({
  startYear: initialStartYear,
  endYear: initialEndYear,
}: UseYearsRangeProps): UseYearsRangeProps {
  const [startYear, setStartYear] = useState<number>(initialStartYear);
  const [endYear, setEndYear] = useState<number>(initialEndYear);

  const setYearsRange = ({
    startYear: startYearParam,
    endYear: endYearParam,
  }: YearsRangeParams) => {
    setStartYear(startYearParam);
    setEndYear(endYearParam);
  };

  return {
    startYear,
    endYear,
    setStartYear,
    setEndYear,
    setYearsRange,
  };
}
