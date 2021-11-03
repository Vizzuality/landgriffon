import React, { useCallback, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { useYears } from 'lib/hooks/years';

import { YearsFilterProps } from './types';
import SingleYearFilter from './single-year';
import MultiYearFilter from './multi-year';

const YearsFilter: React.FC<YearsFilterProps> = () => {
  const dispatch = useAppDispatch();
  const {
    visualizationMode,
    filters: { startYear, endYear },
  } = useAppSelector(analysis);

  const { data, isLoading } = useYears();

  const onChangeStartYear = useCallback(
    (newValue: number) => {
      dispatch(
        setFilter({
          id: 'startYear',
          value: newValue,
        })
      );
    },
    [dispatch]
  );

  const onChangeEndYear = useCallback(
    (newValue: number) => {
      dispatch(
        setFilter({
          id: 'endYear',
          value: newValue,
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    if (!isLoading && data) {
      onChangeStartYear(startYear ?? data[0]);

      if (data.length > 1) {
        onChangeEndYear(endYear ?? data[data.length - 1]);
      }
    }
  }, [data, isLoading, onChangeStartYear, onChangeEndYear]);

  if (visualizationMode === 'map') {
    return <SingleYearFilter data={data ?? []} value={endYear} onChange={onChangeEndYear} />;
  }

  return (
    <MultiYearFilter
      data={data ?? []}
      startValue={startYear}
      endValue={endYear}
      onChangeStartValue={onChangeStartYear}
      onChangeEndValue={onChangeEndYear}
    />
  );
};

export default YearsFilter;
