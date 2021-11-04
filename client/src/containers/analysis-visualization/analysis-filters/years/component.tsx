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
    filters: { startYear, endYear, materials, indicator },
    layer,
  } = useAppSelector(analysis);

  const { data, isLoading } = useYears(layer, materials, indicator);

  const onChangeStartYear = useCallback(
    (newValue: number) => {
      dispatch(
        setFilter({
          id: 'startYear',
          value: newValue,
        }),
      );
    },
    [dispatch],
  );

  const onChangeEndYear = useCallback(
    (newValue: number) => {
      dispatch(
        setFilter({
          id: 'endYear',
          value: newValue,
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (!isLoading && data) {
      onChangeStartYear(startYear ? data.find((year) => year === startYear) ?? data[0] : data[0]);
      onChangeEndYear(
        endYear
          ? data.find((year) => year === endYear) ?? data?.[data.length - 1]
          : data?.[data.length - 1],
      );
    }
  }, [data, isLoading, layer, materials, indicator, onChangeStartYear, onChangeEndYear]);

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
