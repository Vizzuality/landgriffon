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
  console.log(data)
  const data2 = [
    {
      children: [{
        children: [],
        createdAt: "2022-01-31T18:27:44.520Z",
        description: "Coffee, whether or not roasted or decaffeinated; husks and skins; coffee substitutes containing coffee in any proportion",
        hsCodeId: "901",
        id: "0d698ac1-9599-4dab-864b-45e028810992",
        name: "Coffee",
        parentId: "5ba2d1c4-4ec6-4931-ae65-ac603ac631aa",
        updatedAt: "2022-01-31T18:27:44.520Z",
      }],
      createdAt: "2022-01-31T18:27:44.520Z",
      description: "Cereals",
      hsCodeId: "10",
      id: "ed626334-1a6a-43c2-b52f-a61e94e756b4",
      name: "Cereals",
      parentId: null,
      type: "materials",
      updatedAt: "2022-01-31T18:27:44.520Z",
    },
    {
      children: [
        {
          children: [],
          createdAt: "2022-01-31T18:27:44.520Z",
          description: "Coffee, whether or not roasted or decaffeinated; husks and skins; coffee substitutes containing coffee in any proportion",
          hsCodeId: "901",
          id: "0d698ac1-9599-4dab-864b-45e028810992",
          name: "Coffee",
          parentId: "5ba2d1c4-4ec6-4931-ae65-ac603ac631aa",
          updatedAt: "2022-01-31T18:27:44.520Z",
        }],
      createdAt: "2022-01-31T18:27:44.520Z",
      description: "Coffee, tea, mate and spices",
      hsCodeId: "9",
      id: "5ba2d1c4-4ec6-4931-ae65-ac603ac631aa",
      name: "Coffee, whether or not roasted or decaffeinated; husks and skins; coffee substitutes containing coffee in any proportion",
      parentId: null,
      type: "materials",
      updatedAt: "2022-01-31T18:27:44.520Z",
    },
  ];
  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data2?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id }) => ({ label: name, value: id })),
        })),
        'label',
      ),
    [data2],
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
