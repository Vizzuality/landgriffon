import React, { useCallback } from 'react';

import Component from './component';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setFilter, analysisFilters } from 'store/features/analysis/filters';

const MaterialsFilter: React.FC<{ multiple?: boolean }> = (props) => {
  const { multiple = false } = props;
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'suppliers', value: [selected] })),
    [dispatch],
  );

  return <Component current={filters.suppliers} multiple={multiple} onChange={handleChange} />;
};

export default MaterialsFilter;
