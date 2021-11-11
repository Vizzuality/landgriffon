import { useCallback, useMemo } from 'react';
import { TreeSelect, TreeSelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import { useQuery } from 'react-query';
import sortBy from 'lodash.sortby';

import { getSuppliersTrees } from 'services/suppliers';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

type SuppliersFilterProps = TreeSelectProps<unknown> & {
  onChange: (value) => void;
};

const MaterialsFilter: React.FC<SuppliersFilterProps> = (props: SuppliersFilterProps) => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { data, isLoading, error } = useQuery('suppliersTreesList', getSuppliersTrees);

  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'suppliers', value: [selected] })),
    [dispatch],
  );

  const treeData = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          key: id,
          children: children?.map(({ name, id }) => ({ label: name, key: id })),
        })),
        'label',
      ),
    [data],
  );

  return (
    <TreeSelect
      onChange={handleChange}
      labelInValue
      loading={isLoading}
      placeholder={error ? 'Something went wrong' : 'Select suppliers'}
      multiple={false}
      value={filters.suppliers}
      showArrow
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      suffixIcon={<ChevronDownIcon />}
      treeDefaultExpandAll={false}
      treeCheckable
      disabled={!!error}
      treeNodeFilterProp="title"
      removeIcon={<XIcon />}
      maxTagCount={5}
      maxTagPlaceholder={(e) => `${e.length} more...`}
      showSearch
      {...props}
      treeData={treeData}
    />
  );
};

export default MaterialsFilter;
