import { useCallback, useState } from 'react';
import type { UseQueryResult } from 'react-query';
import { TreeSelect } from 'antd';

import type { Supplier } from 'types';

const { TreeNode } = TreeSelect;

type SuppliersFilterProps = {
  suppliers: {
    data: Supplier[];
    isLoading: UseQueryResult['isLoading'];
    error: UseQueryResult['error'];
  };
};

const MaterialsFilter: React.FC<SuppliersFilterProps> = ({ suppliers }: SuppliersFilterProps) => {
  const [value, setValue] = useState([]);
  const { data, isLoading, error } = suppliers;

  // useEffect(() =>
  //   if (!isLoading && data) setValue([]);
  // }, [data, isLoading]);

  const handleChange = useCallback((currentValue) => {
    setValue(currentValue);
  }, []);

  const renderTreeNode = (supplier) => (
    <TreeNode key={supplier.id} value={supplier.id} title={supplier.name}>
      {supplier.children && supplier.children.map((childSupplier) => renderTreeNode(childSupplier))}
    </TreeNode>
  );

  if (!data) return null;

  return (
    <div>
      <div className="mb-1">Supplier</div>
      <TreeSelect
        onChange={handleChange}
        labelInValue
        className="w-full"
        loading={isLoading}
        placeholder={error ? 'Something went wrong' : 'Select suppliers'}
        multiple
        allowClear
        treeDefaultExpandAll
        treeCheckable
        disabled={!!error}
        treeNodeFilterProp="title"
      >
        {data.map((supplier) => renderTreeNode(supplier))}
      </TreeSelect>
    </div>
  );
};

export default MaterialsFilter;
