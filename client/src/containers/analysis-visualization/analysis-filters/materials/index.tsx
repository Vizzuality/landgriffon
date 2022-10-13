import React, { useCallback } from 'react';

import Component from './component';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilter } from 'store/features/analysis/filters';

import type { MaterialsFilterProps } from './component';

const MaterialsFilter = <IsMulti extends boolean = false>(props: MaterialsFilterProps<IsMulti>) => {
  const dispatch = useAppDispatch();
  const { materials } = useAppSelector(analysisFilters);
  const handleChange = useCallback(
    (selected) => {
      dispatch(setFilter({ id: 'materials', value: [selected] }));
    },
    [dispatch],
  );

  return <Component current={materials} onChange={handleChange} {...props} />;
};

export default MaterialsFilter;
