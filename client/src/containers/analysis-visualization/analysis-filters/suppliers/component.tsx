import { useCallback, useState, useMemo } from 'react';
import type { UseQueryResult } from 'react-query';
import { TreeSelect } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';

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

  const handleChange = useCallback((currentValue) => {
    setValue(currentValue);
  }, []);

  const renderTreeNode = (supplier) => (
    <TreeNode key={supplier.id} value={supplier.id} title={supplier.name}>
      {supplier.children && supplier.children.map((childSupplier) => renderTreeNode(childSupplier))}
    </TreeNode>
  );

  const options = useMemo(() => data && data.map((supplier) => renderTreeNode(supplier)), [data]);

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
        showArrow
        suffixIcon={<ChevronDownIcon />}
        value={value}
        treeDefaultExpandAll
        treeCheckable
        disabled={!!error}
        treeNodeFilterProp="title"
        removeIcon={<XIcon />}
      >
        {options}
      </TreeSelect>
    </div>
  );
};

export default MaterialsFilter;
