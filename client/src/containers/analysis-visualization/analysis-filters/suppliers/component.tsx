import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useSuppliersTrees, SuppliersTreesParams } from 'hooks/suppliers';

import type { TreeSelectProps } from 'components/tree-select/types';

type SuppliersFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: SuppliersTreesParams['depth'];
  /** Only suppliers with sourcing locations. */
  withSourcingLocations?: SuppliersTreesParams['withSourcingLocations'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'primary' | 'secondary';
};

const SuppliersFilter: React.FC<SuppliersFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  onChange,
}) => {
  const { data, isFetching } = useSuppliersTrees({ depth, withSourcingLocations });

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
    />
  );
};

export default SuppliersFilter;
