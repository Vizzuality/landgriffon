import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import type { MaterialsTreesParams } from 'hooks/materials';
import { useMaterialsTrees } from 'hooks/materials';

import TreeSelect from 'components/tree-select';
import type { TreeSelectOption, TreeSelectProps } from 'components/tree-select/types';

interface MaterialsFilterProps
  extends MaterialsTreesParams,
    Pick<
      TreeSelectProps,
      'current' | 'multiple' | 'onChange' | 'theme' | 'ellipsis' | 'fitContent'
    > {}

const MaterialsFilter = ({
  multiple = false,
  current,
  depth = 1,
  supplierIds,
  businessUnitIds,
  originIds,
  locationTypes,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  scenarioId,
  onChange,
  theme,
  ellipsis,
  fitContent,
}: MaterialsFilterProps) => {
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
      multiple={multiple as false}
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="Materials"
      onChange={onChange as (value: TreeSelectOption) => void}
      current={current as TreeSelectOption}
      theme={theme}
      fitContent={fitContent}
      ellipsis={ellipsis}
    />
  );
};

export default MaterialsFilter;
