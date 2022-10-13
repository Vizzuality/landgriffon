import React, { useCallback } from 'react';

import Component from './component';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';

const LocationTypesFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { locationTypes } = useAppSelector(analysisFilters);
  const handleChange = useCallback(
    (selected) => {
      dispatch(setFilter({ id: 'locationTypes', value: [selected] }));
    },
    [dispatch],
  );

  return <Component current={locationTypes} onChange={handleChange} />;
};

export default LocationTypesFilter;
