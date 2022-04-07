import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useMaterialsTrees, MaterialsTreesParams } from 'hooks/materials';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

type MaterialsFilterProps = {
  current: TreeSelectProps['current'];
  /** Tree depth. Defaults to `1` */
  currentOptions?: TreeSelectProps['current'];
  depth?: MaterialsTreesParams['depth'];
  ellipsis?: TreeSelectProps['ellipsis'];
  error?: TreeSelectProps['error'];
  fitContent?: TreeSelectProps['fitContent'];
  multiple?: TreeSelectProps['multiple'];
  theme?: 'default' | 'inline-primary';
  /** Only materials with sourcing locations. */
  withSourcingLocations?: MaterialsTreesParams['withSourcingLocations'];
  businessUnitIds?: MaterialsTreesParams['businessUnitIds'];
  supplierIds?: MaterialsTreesParams['supplierIds'];
  originIds?: MaterialsTreesParams['originIds'];
  onChange?: TreeSelectProps['onChange'];
};

const MaterialsFilter: React.FC<MaterialsFilterProps> = ({
  current,
  depth = 1,
  ellipsis,
  error,
  fitContent,
  multiple,
  theme = 'inline-primary',
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  businessUnitIds,
  supplierIds,
  originIds,
  onChange,
  ...props
}) => {
  const { data, isFetching } = useMaterialsTrees({
    depth,
    withSourcingLocations,
    businessUnitIds,
    supplierIds,
    originIds,
  });

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
      {...props}
      multiple={multiple}
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="materials"
      onChange={onChange}
      current={current}
      theme={theme}
      fitContent={fitContent}
      ellipsis={ellipsis}
      error={error}
    />
  );
};

export default MaterialsFilter;
