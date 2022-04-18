import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useMaterialsTrees, MaterialsTreesParams } from 'hooks/materials';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

import { compact } from 'lodash';

type MaterialsFilterProps = {
  /** Tree depth. Defaults to `1` */
  current?: string[];
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
  depth = 1,
  current,
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

  const currentOptions = useMemo(
    () =>
      compact(
        current?.map((c) => {
          return treeOptions.find(
            ({ value, children }) => value === c || children.find((child) => child.value === c),
          );
        }),
      ),
    [current, treeOptions],
  );

  return (
    <TreeSelect
      {...props}
      multiple={multiple}
      showSearch
      current={currentOptions}
      loading={isFetching}
      options={treeOptions}
      placeholder="materials"
      onChange={onChange}
      theme={theme}
      fitContent={fitContent}
      ellipsis={ellipsis}
      error={error}
    />
  );
};

export default MaterialsFilter;
