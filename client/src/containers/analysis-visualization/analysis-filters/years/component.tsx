import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { toNumber, isFinite } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import { useYears } from 'hooks/years';

import Select from 'components/select';

import MultiYearFilter from './multi-year';

import type { SelectProps, SelectOptions, SelectOption } from 'components/select/types';

const YearsFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { visualizationMode, filters, layer } = useAppSelector(analysis);
  const { startYear, endYear, materials, indicator } = filters;
  const [additionalYear, setAdditionalYear] = useState<number>(null);

  const { data, isLoading } = useYears(layer, materials, indicator);

  const dataWithAdditionalYear: number[] = useMemo(() => {
    const result = [...data];
    if (additionalYear) result.push(additionalYear);
    return result;
  }, [data, additionalYear]);

  const handleAdditionalYear: SelectProps['onSearch'] = useCallback(
    (searchTerm) => {
      if (!isFinite(toNumber(searchTerm)) || toNumber(searchTerm) <= data[0]) {
        return;
      }

      const existsMatch = data.some((year) => `${year}`.includes(searchTerm));
      if (!existsMatch) {
        setAdditionalYear(toNumber(searchTerm));
      }
    },
    [data],
  );

  const onChangeStartYear = useCallback(
    (selected) => {
      dispatch(
        setFilter({
          id: 'startYear',
          value: selected.value,
        }),
      );
    },
    [dispatch],
  );

  const onChangeEndYear = useCallback(
    (selected) => {
      dispatch(
        setFilter({
          id: 'endYear',
          value: selected.value,
        }),
      );
    },
    [dispatch],
  );

  const optionsStartYear: SelectOptions = useMemo(
    () =>
      data?.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [data],
  );

  const optionsEndYear: SelectOptions = useMemo(() => {
    const result = [...data];
    if (additionalYear) result.push(additionalYear);
    return result.map((year) => ({
      label: year.toString(),
      value: year,
    }));
  }, [data, additionalYear]);

  const currentStartYearValue: SelectOption = useMemo(
    () => optionsStartYear.find((option) => option.value === startYear),
    [optionsStartYear, startYear],
  );

  const currentEndYearValue: SelectOption = useMemo(
    () => optionsEndYear.find((option) => option.value === endYear),
    [endYear, optionsEndYear],
  );

  useEffect(() => {
    if (!isLoading && dataWithAdditionalYear) {
      onChangeStartYear({
        value: startYear
          ? dataWithAdditionalYear.find((year) => year === startYear) ?? dataWithAdditionalYear[0]
          : dataWithAdditionalYear[0],
      });
      onChangeEndYear({
        value: endYear
          ? dataWithAdditionalYear.find((year) => year === endYear) ??
            dataWithAdditionalYear?.[dataWithAdditionalYear.length - 1]
          : dataWithAdditionalYear?.[dataWithAdditionalYear.length - 1],
      });
    }
  }, [
    dataWithAdditionalYear,
    isLoading,
    layer,
    materials,
    indicator,
    onChangeStartYear,
    onChangeEndYear,
    startYear,
    endYear,
  ]);

  if (visualizationMode === 'map') {
    return (
      <Select
        loading={isLoading}
        current={currentEndYearValue}
        options={optionsEndYear}
        showSearch
        onChange={onChangeEndYear}
        onSearch={handleAdditionalYear}
      />
    );
  }

  return null;
  // return (
  //   <MultiYearFilter
  //     data={data ?? []}
  //     loading={isLoading}
  //     startValue={startYear}
  //     endValue={endYear}
  //     onChangeStartValue={onChangeStartYear}
  //     onChangeEndValue={onChangeEndYear}
  //   />
  // );
};

export default YearsFilter;
