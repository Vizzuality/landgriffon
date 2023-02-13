import { useMemo } from 'react';

import { useMaterialsTrees } from 'hooks/materials';
import TreeSelect from 'components/tree-select';
import { recursiveMap, recursiveSort } from 'components/tree-select/utils';

import type { MakePropOptional } from 'types';
import type { MaterialsTreesParams } from 'hooks/materials';
import type { TreeSelectProps, TreeSelectOption } from 'components/tree-select/types';

export interface MaterialsFilterProps<IsMulti extends boolean>
  extends MaterialsTreesParams,
    MakePropOptional<TreeSelectProps<IsMulti>, 'options'> {}

const MaterialsFilter = <IsMulti extends boolean>({
  depth = 1,
  supplierIds,
  businessUnitIds,
  originIds,
  locationTypes,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  scenarioId,
  options,
  ...props
}: MaterialsFilterProps<IsMulti>) => {
  const { data: materials, isFetching } = useMaterialsTrees<TreeSelectOption<string>[]>(
    {
      depth,
      supplierIds,
      businessUnitIds,
      originIds,
      locationTypes,
      withSourcingLocations,
      scenarioId,
    },
    {
      enabled: !options,
      select: (_materials) =>
        options ??
        recursiveSort(_materials, 'name')?.map((item) =>
          recursiveMap(item, ({ id, name, status }) => ({
            value: id,
            label: name,
            disabled: status === 'inactive',
          })),
        ),
    },
  );

  const treeOptions = useMemo(() => options ?? materials, [materials, options]);

  return (
    <TreeSelect
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="Materials"
      {...props}
    />
  );
};

export default MaterialsFilter;
