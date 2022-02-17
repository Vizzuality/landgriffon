import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useAdminRegionsTrees, AdminRegionsTreesParams } from 'hooks/admin-regions';
import type { TreeSelectProps } from 'components/tree-select/types';

type OriginRegionsFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: AdminRegionsTreesParams['depth'];
  /** Only regions with sourcing locations. */
  withSourcingLocations?: AdminRegionsTreesParams['withSourcingLocations'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'primary' | 'secondary';
};

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  onChange,
  theme,
}) => {
  const { data, isFetching } = useAdminRegionsTrees({ depth, withSourcingLocations });

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
      placeholder="Sorcing regions"
      onChange={onChange}
      current={current}
      theme={theme}
    />
  );
};

export default OriginRegionsFilter;
