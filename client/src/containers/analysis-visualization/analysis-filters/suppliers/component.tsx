import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import type { SuppliersTreesParams } from 'hooks/suppliers';
import { useSuppliersTrees } from 'hooks/suppliers';

import type { TreeSelectProps } from 'components/tree-select/types';

type SuppliersFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: SuppliersTreesParams['depth'];
  /** Only suppliers with sourcing locations. */
  withSourcingLocations?: SuppliersTreesParams['withSourcingLocations'];
  originIds?: SuppliersTreesParams['originIds'];
  businessUnitIds?: SuppliersTreesParams['businessUnitIds'];
  materialIds?: SuppliersTreesParams['materialIds'];
  locationTypes?: SuppliersTreesParams['locationTypes'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  ellipsis?: TreeSelectProps['ellipsis'];
  fitContent?: TreeSelectProps['fitContent'];
};

const SuppliersFilter: React.FC<SuppliersFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  originIds,
  businessUnitIds,
  materialIds,
  locationTypes,
  onChange,
  theme,
  ellipsis,
  fitContent,
}) => {
  const { data, isFetching } = useSuppliersTrees(
    {
      depth,
      originIds,
      businessUnitIds,
      materialIds,
      locationTypes,
      withSourcingLocations,
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
