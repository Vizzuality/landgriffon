import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useMaterialsTrees, MaterialsTreesParams } from 'hooks/materials';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

type MaterialsFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: MaterialsTreesParams['depth'];
  /** Only materials with sourcing locations. */
  withSourcingLocations?: MaterialsTreesParams['withSourcingLocations'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  currentOptions?: TreeSelectProps['current'];
  ellipsis?: TreeSelectProps['ellipsis'];
};

const MaterialsFilter: React.FC<MaterialsFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  onChange,
  theme,
  ellipsis,
}) => {
  const { data, isFetching } = useMaterialsTrees({ depth, withSourcingLocations });

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
      theme={theme}
      ellipsis={ellipsis}
    />
  );
};

export default MaterialsFilter;
