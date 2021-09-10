import React, { useCallback, useState } from 'react';
import { useQuery } from 'react-query';
import { TreeSelect, TreeSelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';

import { getMaterialsTrees } from 'services/materials';

const { TreeNode } = TreeSelect;

type MaterialsFilterProps = TreeSelectProps<{}> & {
  onChange: (value) => void;
};

const MaterialsFilter: React.FC<MaterialsFilterProps> = (props: MaterialsFilterProps) => {
  const { multiple, onChange } = props;
  const [value, setValue] = useState(multiple ? [] : undefined);
  const { data, isLoading, error } = useQuery('materialsTreesList', getMaterialsTrees);

  const handleChange = useCallback(
    (currentValue) => {
      setValue(currentValue);
      if (onChange) onChange(currentValue);
    },
    [onChange]
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
      multiple={false}
      showArrow
      treeDefaultExpandAll
      treeCheckable={false}
      value={value}
      disabled={!!error}
      treeNodeFilterProp="title"
      suffixIcon={<ChevronDownIcon />}
      removeIcon={<XIcon />}
      maxTagCount={5}
      maxTagPlaceholder={(e) => `${e.length} more...`}
      {...props}
    >
      {data && data.map((material) => renderTreeNode(material))}
    </TreeSelect>
  );
};

export default MaterialsFilter;
