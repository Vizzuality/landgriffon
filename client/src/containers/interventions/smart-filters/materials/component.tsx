import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useMaterialsTrees, MaterialsTreesParams } from 'hooks/materials';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

type MaterialsFilterProps = {
  /** Tree depth. Defaults to `1` */
  current?: string[] | string;
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
  locationTypes?: MaterialsTreesParams['locationTypes'];
  onChange?: TreeSelectProps['onChange'];
};

const MaterialsFilter: React.FC<MaterialsFilterProps> = ({
  depth = 1,
  current,
  ellipsis,
  error,
  fitContent,
  multiple,
  theme = 'default',
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  businessUnitIds,
  supplierIds,
  originIds,
  locationTypes,
  onChange,
  ...props
}) => {
  const { data, isFetching } = useMaterialsTrees({
    depth,
    withSourcingLocations,
    businessUnitIds,
    supplierIds,
    originIds,
    locationTypes,
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

  const currentOptions = useMemo(() => {
    const checkedOptions = [];
    if (current && Array.isArray(current)) {
      current?.forEach((key) => {
        const recursiveSearch = (arr) => {
          arr.forEach((opt) => {
            if (opt.value === key) checkedOptions.push(opt);
            if (opt.children) recursiveSearch(opt.children);
          });
        };
        recursiveSearch(treeOptions);
      });
    } else {
      treeOptions.forEach((opt) => {
        if (opt.value === current) checkedOptions.push(opt);
      });
    }
    return checkedOptions;
  }, [current, treeOptions]);

  return (
    <TreeSelect
      {...props}
      multiple={multiple}
      showSearch
      current={currentOptions}
      loading={isFetching}
      options={treeOptions}
      placeholder="all materials"
      onChange={onChange}
      theme={theme}
      fitContent={fitContent}
      ellipsis={ellipsis}
      error={error}
    />
  );
};

export default MaterialsFilter;
