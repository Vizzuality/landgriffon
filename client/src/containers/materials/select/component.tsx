import React from 'react';

import { useMaterialsTrees } from 'hooks/materials';
import TreeSelect from 'components/tree-select';
import { recursiveMap, recursiveSort } from 'components/tree-select/utils';

import type { MaterialsTreesParams } from 'hooks/materials';
import type { ComponentRef, Ref } from 'react';
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
  ref: Ref<ComponentRef<typeof TreeSelect>>,
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
      select: (_materials) =>
        recursiveSort(_materials, 'name')?.map((item) =>
          recursiveMap(item, ({ id, name, status }) => ({
            value: id,
            label: name,
            disabled: status === 'inactive',
          })),
        ),
    },
  );

  return (
    <TreeSelect
      multiple={multiple}
      showSearch
      loading={isFetching}
      options={data}
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
  props: MaterialsFilterProps<IsMulti> & { ref?: Ref<ComponentRef<typeof TreeSelect>> },
) => React.ReactElement;
export default MaterialsFilter;
