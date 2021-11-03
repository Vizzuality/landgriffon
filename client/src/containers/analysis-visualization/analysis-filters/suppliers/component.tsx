import { useCallback, useMemo } from 'react';
import { TreeSelect, TreeSelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import { useQuery } from 'react-query';

import { getSuppliersTrees } from 'services/suppliers';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

const { TreeNode } = TreeSelect;

type SuppliersFilterProps = TreeSelectProps<{}> & {
  onChange: (value) => void;
};

const MaterialsFilter: React.FC<SuppliersFilterProps> = (props: SuppliersFilterProps) => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { data, isLoading, error } = useQuery('suppliersTreesList', getSuppliersTrees);

  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'suppliers', value: [selected] })),
    []
  );

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
      value={filters.suppliers}
      showArrow
      suffixIcon={<ChevronDownIcon />}
      treeDefaultExpandAll
      treeCheckable
      disabled={!!error}
      treeNodeFilterProp="title"
      removeIcon={<XIcon />}
      maxTagCount={5}
      maxTagPlaceholder={(e) => `${e.length} more...`}
      showSearch
      {...props}
    >
      {options}
    </TreeSelect>
  );
};

export default MaterialsFilter;
