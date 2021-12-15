import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useAdminRegionsTrees } from 'hooks/admin-regions';
import type { TreeSelectProps } from 'components/tree-select/types';

type OriginRegionsFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  onChange?: TreeSelectProps['onChange'];
};

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = ({
  multiple,
  current,
  onChange,
}) => {
  const { data, isFetching } = useAdminRegionsTrees({ depth: 1 });

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
      loading={isFetching}
      options={treeOptions}
      placeholder="Materials"
      onChange={onChange}
      current={current}
    />
  );
};

export default OriginRegionsFilter;
