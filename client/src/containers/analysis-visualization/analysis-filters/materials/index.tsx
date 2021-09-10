import { useCallback } from 'react';
import { useAppDispatch } from 'store/hooks';
import { setFilter } from 'store/features/analysis';

import Component from './component';

export default (props) => {
  const dispatch = useAppDispatch();
  const handleChange = useCallback(
    ({ value }) => dispatch(setFilter({ id: 'materials', value: [value] })),
    []
  );

  return <Component onChange={handleChange} {...props} />;
};
