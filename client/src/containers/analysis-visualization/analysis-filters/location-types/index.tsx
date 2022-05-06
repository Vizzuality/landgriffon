import React, { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';

import Component from './component';

const LocationTypesFilter: React.FC<{ multiple?: boolean }> = ({ multiple = false }) => {
  const dispatch = useAppDispatch();
  const { locationTypes } = useAppSelector(analysisFilters);
  const handleChange = useCallback(
    (selected) => {
      dispatch(setFilter({ id: 'locationTypes', value: [selected] }));
    },
    [dispatch],
  );

  return <Component current={locationTypes} multiple={multiple} onChange={handleChange} />;
};

export default LocationTypesFilter;
