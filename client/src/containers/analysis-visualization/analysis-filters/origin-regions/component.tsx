import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import type { AdminRegionsTreesParams } from 'hooks/admin-regions';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import type { TreeSelectProps } from 'components/tree-select/types';

interface OriginRegionsFilterProps
  extends AdminRegionsTreesParams,
    Pick<
      TreeSelectProps,
      'current' | 'multiple' | 'onChange' | 'theme' | 'ellipsis' | 'fitContent'
    > {}

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  supplierIds,
  businessUnitIds,
  materialIds,
  locationTypes,
  scenarioId,
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
      scenarioId,
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
