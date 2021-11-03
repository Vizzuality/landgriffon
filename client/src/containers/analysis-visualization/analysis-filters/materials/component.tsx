import React, { useCallback } from 'react';
import { useQuery } from 'react-query';
import { TreeSelect, TreeSelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';

import { getMaterialsTrees } from 'services/materials';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

const { TreeNode } = TreeSelect;

type MaterialsFilterProps = TreeSelectProps<{}>;

const MaterialsFilter: React.FC<MaterialsFilterProps> = (props: MaterialsFilterProps) => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { data, isLoading, error } = useQuery('materialsTreesList', getMaterialsTrees);

  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'materials', value: [selected] })),
    []
  );

  const renderTreeNode = (material) => (
    <TreeNode key={material.id} value={material.id} title={material.name}>
      {material.children && material.children.map((childMaterial) => renderTreeNode(childMaterial))}
    </TreeNode>
  );

  return (
    <TreeSelect
      onChange={handleChange}
      labelInValue
      className="w-40"
      loading={isLoading}
      placeholder={error ? 'Something went wrong' : 'Select materials'}
      value={filters.materials}
      multiple={false}
      showArrow
      treeDefaultExpandAll
      treeCheckable={false}
      disabled={!!error}
      treeNodeFilterProp="title"
      suffixIcon={<ChevronDownIcon />}
      removeIcon={<XIcon />}
      maxTagCount={5}
      maxTagPlaceholder={(e) => `${e.length} more...`}
      showSearch
      {...props}
    >
      {data && data.map((material) => renderTreeNode(material))}
    </TreeSelect>
  );
};

export default MaterialsFilter;
