import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useMaterialsTrees } from 'hooks/materials';
import TreeSelect from 'components/tree-select';

import type { MaterialsTreesParams } from 'hooks/materials';
import type { TreeSelectProps } from 'components/tree-select/types';

interface MaterialsFilterProps<IsMulti extends boolean>
  extends MaterialsTreesParams,
    Pick<
      TreeSelectProps<IsMulti>,
      'current' | 'multiple' | 'onChange' | 'theme' | 'ellipsis' | 'fitContent'
    >,
    Partial<Pick<TreeSelectProps<IsMulti>, 'options'>> {}

const MaterialsFilter = <IsMulti extends boolean = false>({
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
  const { data, isFetching } = useMaterialsTrees(
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
      // 2 minutes stale time
      staleTime: 2 * 60 * 1000,
    },
  );

  const treeOptions = useMemo(
    () =>
      options ??
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id }) => ({ label: name, value: id })),
        })),
        'label',
      ),
    [data, options],
  );

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
