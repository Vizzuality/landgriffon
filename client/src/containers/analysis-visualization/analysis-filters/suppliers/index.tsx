import React, { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

import Component from './component';

const MaterialsFilter: React.FC<{ multiple?: boolean }> = (props) => {
  const { multiple = false } = props;
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'suppliers', value: [selected] })),
    [dispatch],
  );

  return <Component current={filters.suppliers} multiple={multiple} onChange={handleChange} />;
};

export default MaterialsFilter;
