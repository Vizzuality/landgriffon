import React, { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';

import Component from './component';

const MaterialsFilter: React.FC<{ multiple?: boolean }> = ({ multiple = false }) => {
  const dispatch = useAppDispatch();
  const { materials } = useAppSelector(analysisFilters);
  const handleChange = useCallback(
    (selected) => {
      dispatch(setFilter({ id: 'materials', value: [selected] }));
    },
    [dispatch],
  );

  return <Component current={materials} multiple={multiple} onChange={handleChange} />;
};

export default MaterialsFilter;
