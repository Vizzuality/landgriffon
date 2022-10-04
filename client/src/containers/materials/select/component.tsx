import type { Ref } from 'react';
import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import type { MaterialsTreesParams } from 'hooks/materials';
import { useMaterialsTrees } from 'hooks/materials';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

type MaterialsFilterProps<IsMulti extends boolean> = Omit<TreeSelectProps<IsMulti>, 'options'> & {
  /** Tree depth. Defaults to `1` */
  depth?: MaterialsTreesParams['depth'];
  /** Only materials with sourcing locations. */
  withSourcingLocations?: MaterialsTreesParams['withSourcingLocations'];
  theme?: 'default' | 'inline-primary';
  businessUnitIds?: MaterialsTreesParams['businessUnitIds'];
  supplierIds?: MaterialsTreesParams['supplierIds'];
  originIds?: MaterialsTreesParams['originIds'];
  locationTypes?: MaterialsTreesParams['locationTypes'];
};

const InnerMaterialsFilter = <IsMulti extends boolean>(
  {
    multiple,
    current,
    depth = 1,
    supplierIds,
    businessUnitIds,
    originIds,
    locationTypes,
    withSourcingLocations, // Do not a default; backend will override depth if this is set at all
    onChange = () => null,
    theme,
    error,
    ellipsis,
    fitContent,
  }: MaterialsFilterProps<IsMulti>,
  ref: Ref<HTMLInputElement>,
) => {
  const { data, isFetching } = useMaterialsTrees(
    {
      depth,
      supplierIds,
      businessUnitIds,
      originIds,
      locationTypes,
      withSourcingLocations,
    },
    {
      // 2 minutes stale time
      staleTime: 2 * 60 * 1000,
    },
  );

  const treeOptions: TreeSelectProps<IsMulti>['options'] = useMemo(
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
      fitContent={fitContent}
      ellipsis={ellipsis}
      error={error}
      ref={ref}
    />
  );
};

const MaterialsFilter = React.forwardRef(InnerMaterialsFilter) as <IsMulti extends boolean>(
  props: MaterialsFilterProps<IsMulti> & { ref?: Ref<HTMLInputElement> },
) => React.ReactElement;
export default MaterialsFilter;
