import { useCallback, useState, useMemo } from 'react';
import { TreeSelect, TreeSelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import { useQuery } from 'react-query';

import { getSuppliersTrees } from 'services/suppliers';

const { TreeNode } = TreeSelect;

type SuppliersFilterProps = TreeSelectProps<{}> & {
  onChange: (value) => void;
};

const MaterialsFilter: React.FC<SuppliersFilterProps> = (props: SuppliersFilterProps) => {
  const [value, setValue] = useState([]);
  const { data, isLoading, error } = useQuery('suppliersTreesList', getSuppliersTrees);

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
    <TreeSelect
      onChange={handleChange}
      labelInValue
      loading={isLoading}
      placeholder={error ? 'Something went wrong' : 'Select suppliers'}
      multiple={false}
      showArrow
      suffixIcon={<ChevronDownIcon />}
      value={value}
      treeDefaultExpandAll
      treeCheckable
      disabled={!!error}
      treeNodeFilterProp="title"
      removeIcon={<XIcon />}
      maxTagCount={5}
      maxTagPlaceholder={(e) => `${e.length} more...`}
      {...props}
    >
      {options}
    </TreeSelect>
  );
};

export default MaterialsFilter;
