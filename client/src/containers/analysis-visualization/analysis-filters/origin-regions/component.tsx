import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import type { AdminRegionsTreesParams } from 'hooks/admin-regions';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import type { TreeSelectProps } from 'components/tree-select/types';

type OriginRegionsFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: AdminRegionsTreesParams['depth'];
  /** Only regions with sourcing locations. */
  withSourcingLocations?: AdminRegionsTreesParams['withSourcingLocations'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  ellipsis?: TreeSelectProps['ellipsis'];
  fitContent?: TreeSelectProps['fitContent'];
  businessUnitIds?: AdminRegionsTreesParams['businessUnitIds'];
  supplierIds?: AdminRegionsTreesParams['supplierIds'];
  materialIds?: AdminRegionsTreesParams['materialIds'];
  locationTypes?: AdminRegionsTreesParams['locationTypes'];
};

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  supplierIds,
  businessUnitIds,
  materialIds,
  locationTypes,
  onChange,
  theme,
  ellipsis,
  fitContent,
}) => {
  const { data, isFetching } = useAdminRegionsTrees(
    {
      depth,
      withSourcingLocations,
      supplierIds,
      businessUnitIds,
      materialIds,
      locationTypes,
    },
    {
      // 2 minutes stale time
      staleTime: 2 * 60 * 1000,
    },
  );

  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id, children }) => ({
            label: name,
            value: id,
            children: children?.map(({ name, id }) => ({ label: name, value: id })),
          })),
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
      placeholder="Sourcing regions"
      onChange={onChange}
      current={current}
      theme={theme}
      ellipsis={ellipsis}
      fitContent={fitContent}
    />
  );
};

export default OriginRegionsFilter;
