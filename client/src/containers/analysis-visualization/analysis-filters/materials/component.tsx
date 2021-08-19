import { useCallback, useState } from 'react';
import type { UseQueryResult } from 'react-query';
import { TreeSelect } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';

import type { Material } from 'types';

const { TreeNode } = TreeSelect;

type MaterialsFilterProps = {
  materials: {
    data: Material[];
    isLoading: UseQueryResult['isLoading'];
    error: UseQueryResult['error'];
  };
};

const MaterialsFilter: React.FC<MaterialsFilterProps> = ({ materials }: MaterialsFilterProps) => {
  const [value, setValue] = useState([]);
  const { data, isLoading, error } = materials;

  // useEffect(() =>
  //   if (!isLoading && data) setValue([]);
  // }, [data, isLoading]);

  const handleChange = useCallback((currentValue) => {
    setValue(currentValue);
  }, []);

  const renderTreeNode = (material) => (
    <TreeNode key={material.id} value={material.id} title={material.name}>
      {material.children && material.children.map((childMaterial) => renderTreeNode(childMaterial))}
    </TreeNode>
  );

  if (!data) return null;

  return (
    <div>
      <div className="mb-1">Material</div>
      <TreeSelect
        onChange={handleChange}
        labelInValue
        className="w-full"
        loading={isLoading}
        placeholder={error ? 'Something went wrong' : 'Select materials'}
        multiple
        showArrow
        treeDefaultExpandAll
        treeCheckable
        disabled={!!error}
        treeNodeFilterProp="title"
        suffixIcon={<ChevronDownIcon />}
        removeIcon={<XIcon />}
      >
        {data.map((material) => renderTreeNode(material))}
      </TreeSelect>
    </div>
  );
};

export default MaterialsFilter;
