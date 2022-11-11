import { useMemo } from 'react';
import { sortBy } from 'lodash-es';

import TreeSelect from 'components/tree-select';
import { useAdminRegionsTrees } from 'hooks/admin-regions';

import type { MakePropOptional } from 'types';
import type { AdminRegionsTreesParams } from 'hooks/admin-regions';
import type { TreeSelectProps } from 'components/tree-select/types';

interface OriginRegionsFilterProps<IsMulti extends boolean>
  extends AdminRegionsTreesParams,
    MakePropOptional<TreeSelectProps<IsMulti>, 'options'> {}

const OriginRegionsFilter = <IsMulti extends boolean>({
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  supplierIds,
  businessUnitIds,
  materialIds,
  locationTypes,
  scenarioId,
  options,
  ...props
}: OriginRegionsFilterProps<IsMulti>) => {
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
      enabled: !options,
    },
  );

  const treeOptions = useMemo<TreeSelectProps<IsMulti>['options']>(
    () =>
      options ??
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
    [data, options],
  );

  return (
    <TreeSelect
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="Sourcing regions"
      {...props}
    />
  );
};

export default OriginRegionsFilter;
