import React, { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';

import Component from './component';

const MaterialsFilter: React.FC<{ multiple?: boolean }> = (props = { multiple: false }) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'origins', value: [selected] })),
    [dispatch],
  );

  return <Component current={filters.origins} {...props} onChange={handleChange} />;
};

export default MaterialsFilter;
