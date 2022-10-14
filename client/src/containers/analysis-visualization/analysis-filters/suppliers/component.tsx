import { useMemo } from 'react';
import { sortBy } from 'lodash';

import TreeSelect from 'components/tree-select';
import { useSuppliersTrees } from 'hooks/suppliers';

import type { MakePropOptional } from 'types';
import type { SuppliersTreesParams } from 'hooks/suppliers';
import type { TreeSelectProps } from 'components/tree-select/types';

interface SuppliersFilterProps<IsMulti extends boolean>
  extends SuppliersTreesParams,
    MakePropOptional<TreeSelectProps<IsMulti>, 'options'> {}

const SuppliersFilter = <IsMulti extends boolean>({
  options,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  originIds,
  businessUnitIds,
  materialIds,
  locationTypes,
  scenarioId,
  onChange,
  ...props
}: SuppliersFilterProps<IsMulti>) => {
  const { data, isFetching } = useSuppliersTrees(
    {
      depth,
      originIds,
      businessUnitIds,
      materialIds,
      locationTypes,
      withSourcingLocations,
      scenarioId,
    },
    {
      // 2 minutes stale time
      staleTime: 2 * 60 * 1000,
      enabled: !options,
    },
  );

  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      options ??
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id }) => ({ label: name, value: id })),
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
      placeholder="Suppliers"
      onChange={onChange}
      {...props}
    />
  );
};

export default SuppliersFilter;
