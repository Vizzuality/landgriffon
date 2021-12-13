import { useCallback, useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';
import { useAdminRegionsTrees } from 'hooks/admin-regions';

import type { TreeSelectProps } from 'components/tree-select/types';

const OriginRegionsFilter: React.FC<{ multiple?: boolean }> = (props) => {
  const { multiple } = props;
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { data, isLoading } = useAdminRegionsTrees({ depth: 1 });

  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'origins', value: [selected] })),
    [dispatch],
  );

  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id }) => ({ label: name, value: id })),
        })),
        'label',
      ),
    [data],
  );

  return (
    <TreeSelect
      multiple={multiple}
      showSearch
      loading={isLoading}
      options={treeOptions}
      placeholder="Materials"
      onChange={handleChange}
      current={filters.materials}
    />
  );
};

export default OriginRegionsFilter;
