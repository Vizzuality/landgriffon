import { useMemo } from 'react';
import { sortBy } from 'lodash';

import TreeSelect from 'components/tree-select';
import { useSuppliersTrees } from 'hooks/suppliers';

import type { SuppliersTreesParams } from 'hooks/suppliers';
import type { TreeSelectProps } from 'components/tree-select/types';

interface SuppliersFilterProps<IsMulti extends boolean>
  extends SuppliersTreesParams,
    Pick<
      TreeSelectProps<IsMulti>,
      'current' | 'multiple' | 'onChange' | 'theme' | 'ellipsis' | 'fitContent'
    > {}

const SuppliersFilter = <IsMulti extends boolean>({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  originIds,
  businessUnitIds,
  materialIds,
  locationTypes,
  scenarioId,
  onChange,
  theme,
  ellipsis,
  fitContent,
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
    },
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
      loading={isFetching}
      options={treeOptions}
      placeholder="Suppliers"
      onChange={onChange}
      current={current}
      theme={theme}
      ellipsis={ellipsis}
      fitContent={fitContent}
    />
  );
};

export default SuppliersFilter;
